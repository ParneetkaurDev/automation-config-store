/**
 * Settlement Amount Calculation Utility - FIS12 2.2.1
 *
 * Calculates SETTLEMENT_AMOUNT dynamically based on BUYER_FINDER_FEES_TYPE:
 *
 *  - "amount"             → flat INR amount = BUYER_FINDER_FEES_AMOUNT
 *  - "percent"            → (BUYER_FINDER_FEES_PERCENTAGE / 100) × total_loan_amount
 *  - "percent-annualized" → (BUYER_FINDER_FEES_PERCENTAGE / 100) × (loan_term_months / 12) × net_disbursed_amount
 */

/**
 * Parses an ISO 8601 duration string and returns the value in months.
 * Supports: PnY, PnM, PnD, PnW (including combinations).
 * Examples: "P5M" → 5, "P1Y" → 12, "P180D" → 6
 */
export function parseISODurationToMonths(isoDuration: string): number {
    if (!isoDuration) return 12; // default to 12 months if not available

    const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?/i;
    const match = isoDuration.match(regex);

    if (!match) {
        console.warn(`[settlement-utils] Could not parse ISO duration: ${isoDuration}, defaulting to 12 months`);
        return 12;
    }

    const years = parseInt(match[1] || "0", 10);
    const months = parseInt(match[2] || "0", 10);
    const weeks = parseInt(match[3] || "0", 10);
    const days = parseInt(match[4] || "0", 10);

    const totalMonths = years * 12 + months + Math.round(weeks * 7 / 30) + Math.round(days / 30);

    console.log(`[settlement-utils] Parsed duration ${isoDuration} → ${totalMonths} months`);
    return totalMonths > 0 ? totalMonths : 12;
}

/**
 * Extracts a tag value from a ONDC-style tags array.
 * @param tags  - Array of tag objects with descriptor.code and list[]
 * @param groupCode - The tag group descriptor code (e.g. "BAP_TERMS")
 * @param itemCode  - The list item descriptor code (e.g. "BUYER_FINDER_FEES_TYPE")
 */
export function extractTagValue(tags: any[], groupCode: string, itemCode: string): string | undefined {
    if (!Array.isArray(tags)) return undefined;

    for (const tag of tags) {
        if (tag?.descriptor?.code === groupCode && Array.isArray(tag?.list)) {
            const item = tag.list.find((i: any) => i?.descriptor?.code === itemCode);
            if (item?.value !== undefined) return String(item.value);
        }
    }
    return undefined;
}

/**
 * Extracts a breakup value from ONDC-style quote.breakup array.
 * @param breakup - Array of breakup objects with title and price.value
 * @param title   - The title to look for (e.g. "NET_DISBURSED_AMOUNT")
 */
export function extractBreakupValue(breakup: any[], title: string): number {
    if (!Array.isArray(breakup)) return 0;
    const entry = breakup.find((b: any) => (b?.title || "").toUpperCase() === title.toUpperCase());
    return parseFloat(entry?.price?.value || "0");
}

/**
 * Calculates the SETTLEMENT_AMOUNT based on ONDC FIS12 BAP_TERMS specification.
 *
 * @param sessionData - The full session data object
 * @returns Calculated settlement amount as a rounded string (e.g. "267")
 */
export function calculateSettlementAmount(sessionData: any): string {
    // --- Read fee parameters saved from search ---
    const feeType = sessionData.buyer_finder_fees_type || "percent-annualized";
    const feePercentage = parseFloat(sessionData.buyer_finder_fees_percentage || "0");
    const feeAmount = parseFloat(sessionData.buyer_finder_fees_amount || "0");

    // --- Read loan parameters saved from on_select ---
    const netDisbursedAmount = parseFloat(sessionData.net_disbursed_amount || "0");
    const totalLoanAmount = parseFloat(sessionData.quote_price || "0");
    const loanTermISO = sessionData.loan_term || "P12M";
    const loanTermMonths = parseISODurationToMonths(loanTermISO);

    console.log("[settlement-utils] Calculating SETTLEMENT_AMOUNT with:", {
        feeType,
        feePercentage,
        feeAmount,
        netDisbursedAmount,
        totalLoanAmount,
        loanTermISO,
        loanTermMonths,
    });

    let settlementAmount = 0;

    switch (feeType) {
        case "amount":
            // Flat INR amount directly
            settlementAmount = feeAmount;
            console.log(`[settlement-utils] amount type → ${settlementAmount}`);
            break;

        case "percent":
            // Absolute percentage of total loan amount
            settlementAmount = (feePercentage / 100) * totalLoanAmount;
            console.log(`[settlement-utils] percent type → ${feePercentage}% × ${totalLoanAmount} = ${settlementAmount}`);
            break;

        case "percent-annualized":
        default:
            // Annualized: scale by actual tenure vs 12 months, applied on net disbursed amount
            settlementAmount = (feePercentage / 100) * (loanTermMonths / 12) * netDisbursedAmount;
            console.log(
                `[settlement-utils] percent-annualized type → ${feePercentage}% × (${loanTermMonths}/12) × ${netDisbursedAmount} = ${settlementAmount}`
            );
            break;
    }

    const result = String(Math.round(settlementAmount));
    console.log(`[settlement-utils] Final SETTLEMENT_AMOUNT = ${result}`);
    return result;
}

/**
 * Injects the settlement amount into all BAP_TERMS payment tags in the payload.
 * Uses sessionData.settlement_amount if available, otherwise calculates it.
 *
 * @param existingPayload - The payload to mutate
 * @param sessionData     - Session data containing fee parameters and loan data
 * @returns The settlement amount string that was injected
 */
export function injectSettlementAmount(existingPayload: any, sessionData: any): string {
    // Use pre-calculated value from session if available, otherwise calculate
    const settlementAmount =
        sessionData.settlement_amount ?? calculateSettlementAmount(sessionData);

    const payments: any[] = existingPayload?.message?.order?.payments || [];

    payments.forEach((payment: any) => {
        if (!Array.isArray(payment?.tags)) return;

        payment.tags.forEach((tag: any) => {
            if (Array.isArray(tag?.list)) {
                const item = tag.list.find(
                    (i: any) => i?.descriptor?.code === "SETTLEMENT_AMOUNT"
                );
                if (item) {
                    item.value = settlementAmount;
                    console.log(`[settlement-utils] Injected SETTLEMENT_AMOUNT = ${settlementAmount} into BAP_TERMS`);
                }
            }
        });
    });

    return settlementAmount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loan Calculation Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts a value from items[0].tags[INFO].list[code] in a standard ONDC payload.
 */
export function extractInfoTagValue(existingPayload: any, code: string): string | undefined {
    const tags: any[] = existingPayload?.message?.order?.items?.[0]?.tags || [];
    for (const tag of tags) {
        if (tag?.descriptor?.code === "INFO" && Array.isArray(tag?.list)) {
            const item = tag.list.find((i: any) => i?.descriptor?.code === code);
            if (item?.value !== undefined) return String(item.value);
        }
    }
    return undefined;
}

/** Full loan detail calculation result */
export interface LoanDetails {
    downPayment: number;
    principalAmount: number;
    netDisbursedAmount: number;
    emiAmount: number;
    totalInterest: number;
    loanTermMonths: number;
    interestRateAnnual: number;
    schedule: Array<{ principal: number; interest: number; outstanding: number }>;
}

/**
 * Calculates full loan details from sessionData.
 *
 * Key inputs from sessionData:
 *   form_data.down_payment_form.updateDownpayment  → user-entered down payment
 *   loan_amount  (or quote_price)                  → total product price
 *   loan_term                                      → ISO 8601 e.g. "P5M"
 *   interest_rate                                  → e.g. "12 %" or "12"
 */
export function calculateLoanDetails(sessionData: any, existingPayload?: any): LoanDetails {

    const downPayment = parseFloat(
        sessionData?.form_data?.down_payment_form?.updateDownpayment
        ?? sessionData?.down_payment
        ?? "0"
    );

    const loanAmount = parseFloat(sessionData?.loan_amount ?? "70000");
    const principalAmount = loanAmount - downPayment;

    let processingFee = 0;
    let insuranceCharges = 0;
    let otherUpfront = 0;

    const breakup: any[] = existingPayload?.message?.order?.quote?.breakup ?? [];

    breakup.forEach((b: any) => {
        const t = (b?.title || "").toUpperCase();
        const v = parseFloat(b?.price?.value || "0");

        if (t === "PROCESSING_FEE") processingFee = v;
        if (t === "INSURANCE_CHARGES") insuranceCharges = v;
        if (t === "OTHER_UPFRONT_CHARGES") otherUpfront = v;
    });

    const netDisbursedAmount =
        principalAmount - processingFee - insuranceCharges - otherUpfront;

    const rawRate = String(sessionData?.interest_rate ?? "12");
    const interestRateAnnual =
        parseFloat(rawRate.replace(/[^0-9.]/g, "")) || 12;

    const monthlyRate = interestRateAnnual / 12 / 100;

    const loanTermMonths =
        parseISODurationToMonths(sessionData?.loan_term ?? "P5M");

    let emiExact: number;

    if (monthlyRate === 0) {
        emiExact = principalAmount / loanTermMonths;
    } else {
        const factor = Math.pow(1 + monthlyRate, loanTermMonths);
        emiExact = (principalAmount * monthlyRate * factor) / (factor - 1);
    }

    const emiAmount = Math.round(emiExact);

    // FIX: interest always derived from EMI
    const totalInterest =
        (emiAmount * loanTermMonths) - principalAmount;

    const schedule: LoanDetails["schedule"] = [];
    let outstanding = principalAmount;

    for (let i = 0; i < loanTermMonths; i++) {

        const interestThisMonth = outstanding * monthlyRate;
        let principalThisMonth = emiAmount - interestThisMonth;

        // FIX: adjust last EMI
        if (i === loanTermMonths - 1) {
            principalThisMonth = outstanding;
        }

        outstanding = Math.max(0, outstanding - principalThisMonth);

        schedule.push({
            principal: Math.round(principalThisMonth),
            interest: Math.round(interestThisMonth),
            outstanding: Math.round(outstanding)
        });
    }

    console.log("[settlement-utils] calculateLoanDetails:", {
        loanAmount,
        downPayment,
        principalAmount,
        processingFee,
        insuranceCharges,
        netDisbursedAmount,
        interestRateAnnual,
        loanTermMonths,
        emiAmount,
        totalInterest
    });

    return {
        downPayment,
        principalAmount,
        netDisbursedAmount,
        emiAmount,
        totalInterest,
        loanTermMonths,
        interestRateAnnual,
        schedule
    };
}


/**
 * Injects computed loan values into the payload AND saves them to sessionData.
 * Updates: quote.breakup, items[0] INFO tags, PRE_ORDER payment amount.
 * Clears sessionData.settlement_amount so init recalculates with fresh net_disbursed_amount.
 */
export function injectLoanDetails(existingPayload: any, sessionData: any, details?: LoanDetails): LoanDetails {
    const d = details ?? calculateLoanDetails(sessionData, existingPayload);

    // Save to session for downstream use
    sessionData.down_payment = d.downPayment;
    sessionData.principal_amount = d.principalAmount;
    sessionData.net_disbursed_amount = d.netDisbursedAmount;
    sessionData.emi_amount = d.emiAmount;
    sessionData.total_interest = d.totalInterest;
    sessionData.loan_term_months = d.loanTermMonths;
    sessionData.settlement_amount = undefined; // force recalc in init

    // Update quote.breakup
    const quote = existingPayload?.message?.order?.quote;
    if (quote) {
        const upsert = (title: string, value: number) => {
            const bkp: any[] = quote.breakup || [];
            const idx = bkp.findIndex((b: any) => (b?.title || "").toUpperCase() === title.toUpperCase());
            const row = { title, price: { value: String(Math.round(value)), currency: "INR" } };
            if (idx >= 0) bkp[idx] = row; else bkp.push(row);
            quote.breakup = bkp;
        };
        upsert("PRINCIPAL_AMOUNT", d.principalAmount);
        upsert("INTEREST_AMOUNT", d.totalInterest);
        upsert("NET_DISBURSED_AMOUNT", d.netDisbursedAmount);
        const processingFee = parseFloat((quote.breakup || []).find((b: any) => b.title === "PROCESSING_FEE")?.price?.value || "0");
        const insuranceCharges = parseFloat((quote.breakup || []).find((b: any) => b.title === "INSURANCE_CHARGES")?.price?.value || "0");
        const totalLoan = d.principalAmount + d.totalInterest + processingFee + insuranceCharges;
        quote.price = { currency: "INR", value: String(Math.round(totalLoan)) };
        console.log("[settlement-utils] Updated quote.price:", totalLoan);
    }

    // Update items[0] - price and INFO tags
    const item0 = existingPayload?.message?.order?.items?.[0];
    if (item0) {
        // const bkp: any[] = existingPayload?.message?.order?.quote?.breakup || [];
        // const processingFee = parseFloat(bkp.find((b: any) => b.title === "PROCESSING_FEE")?.price?.value || "0");
        // const insuranceCharges = parseFloat(bkp.find((b: any) => b.title === "INSURANCE_CHARGES")?.price?.value || "0");
        // // const totalLoan = d.principalAmount + d.totalInterest + processingFee + insuranceCharges;
        // // item0.price = { currency: "INR", value: String(Math.round(totalLoan)) };

        const infoTag = (item0.tags || []).find((t: any) => t?.descriptor?.code === "INFO");
        if (infoTag && Array.isArray(infoTag.list)) {
            const setTag = (code: string, value: string) => {
                const entry = infoTag.list.find((i: any) => i?.descriptor?.code === code);
                if (entry) { entry.value = value; console.log(`[settlement-utils] Set INFO.${code} = ${value}`); }
            };
            setTag("INSTALLMENT_AMOUNT", `${d.emiAmount} INR`);
            setTag("NUMBER_OF_INSTALLMENTS", String(d.loanTermMonths));
        }
    }

    // Update PRE_ORDER payment amount (= down payment)
    if (d.downPayment > 0) {
        const payments: any[] = existingPayload?.message?.order?.payments || [];
        const preOrder = payments.find((p: any) => p?.type === "PRE_ORDER");
        if (preOrder) {
            preOrder.params = preOrder.params || {};
            preOrder.params.amount = String(Math.round(d.downPayment));
            preOrder.params.currency = "INR";
            console.log(`[settlement-utils] Updated PRE_ORDER.params.amount = ${d.downPayment}`);
        }
    }

    return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Installment Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replaces all POST_FULFILLMENT (type="POST_FULFILLMENT") payments in the payload
 * with dynamically generated ones based on the loan amortisation schedule.
 *
 * Each instalment gets:
 *  - id:      PID-5001, PID-5002, …
 *  - params.amount: rounded EMI amount
 *  - time.range.start: 1st of month N
 *  - time.range.end:   last moment of month N
 *  - tags[BREAKUP]: PRINCIPAL_AMOUNT and INTEREST_AMOUNT for that month
 *
 * Non-POST_FULFILLMENT payments (ON_ORDER, PRE_ORDER, etc.) are preserved as-is.
 *
 * @param existingPayload  - The full ONDC message payload (mutated in place)
 * @param sessionData      - Must have emi_amount, loan_term_months, schedule[]
 *                           (set by injectLoanDetails / calculateLoanDetails)
 * @param startFromContext - If true, derive start month from context.timestamp;
 *                           otherwise uses current date. Default = true.
 */
export function generateInstallmentPayments(
    existingPayload: any,
    sessionData: any,
    startFromContext = true
): void {
    const order = existingPayload?.message?.order;
    if (!order) return;

    // ── Resolve amortisation data from session ────────────────────────────────
    const loanTermMonths: number = sessionData?.loan_term_months
        ?? parseISODurationToMonths(sessionData?.loan_term ?? "P5M");

    const emiAmount: number = sessionData?.emi_amount
        ?? parseFloat(sessionData?.quote_price ?? "0");

    // If we already have a schedule in session, use it; otherwise recalculate.
    let schedule: Array<{ principal: number; interest: number; outstanding: number }> =
        sessionData?.schedule ?? [];

    if (schedule.length === 0 && loanTermMonths > 0) {
        const details = calculateLoanDetails(sessionData, existingPayload);
        schedule = details.schedule;
        // Persist for downstream reuse
        sessionData.schedule = schedule;
        sessionData.emi_amount = details.emiAmount;
        sessionData.loan_term_months = details.loanTermMonths;
    }

    // ── Determine start month ─────────────────────────────────────────────────
    const baseTs = startFromContext
        ? existingPayload?.context?.timestamp ?? new Date().toISOString()
        : new Date().toISOString();

    const baseDate = new Date(baseTs);

    // Helper: first moment of a given UTC month
    const monthStart = (year: number, month: number): string =>
        new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString();

    // Helper: last moment of a given UTC month
    const monthEnd = (year: number, month: number): string =>
        new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString();

    // ── Strip existing POST_FULFILLMENT entries ───────────────────────────────
    const otherPayments: any[] = (order.payments || []).filter(
        (p: any) => p?.type !== "POST_FULFILLMENT"
    );

    // ── Build fresh instalment payments ──────────────────────────────────────
    const instalmentPayments: any[] = [];

    for (let i = 0; i < loanTermMonths; i++) {
        const instMonth = baseDate.getUTCMonth() + i;   // may exceed 11 → JS handles rollover
        const year = baseDate.getUTCFullYear() + Math.floor(instMonth / 12);
        const month = instMonth % 12;  // 0-based

        const schRow = schedule[i] ?? { principal: emiAmount, interest: 0, outstanding: 0 };
        const emiDisplay = Math.round(emiAmount);

        instalmentPayments.push({
            type: "POST_FULFILLMENT",
            id: `PID-${5000 + i + 1}`,
            params: {
                amount: String(emiDisplay),
                currency: "INR",
            },
            status: "NOT-PAID",
            time: {
                label: "INSTALLMENT",
                range: {
                    start: monthStart(year, month),
                    end: monthEnd(year, month),
                },
            },
            tags: [
                {
                    descriptor: { code: "BREAKUP", name: "Emi Breakup" },
                    list: [
                        {
                            descriptor: {
                                code: "PRINCIPAL_AMOUNT",
                                name: "Principal",
                                short_desc: "Loan Principal",
                            },
                            value: `${schRow.principal} INR`,
                        },
                        {
                            descriptor: {
                                code: "INTEREST_AMOUNT",
                                name: "Interest",
                                short_desc: "Loan Interest",
                            },
                            value: `${schRow.interest} INR`,
                        },
                    ],
                },
            ],
        });
    }

    order.payments = [...otherPayments, ...instalmentPayments];
    console.log(
        `[settlement-utils] Generated ${instalmentPayments.length} POST_FULFILLMENT instalments (EMI=${emiAmount})`
    );
}
