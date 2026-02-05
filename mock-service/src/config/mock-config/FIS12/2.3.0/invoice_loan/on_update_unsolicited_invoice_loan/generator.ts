import { SessionData } from "../../../session-types";

/**
 * On Update Unsolicited Generator for Invoice Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new message_id for unsolicited callback (BPP-initiated)
 * 4. Handle update labels: FORECLOSURE, MISSED_EMI_PAYMENT, PRE_PART_PAYMENT
 * 5. Generate payment URL and update quote breakup accordingly
 */
export async function onUpdateUnsolicitedGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_update_unsolicited_invoice_loan generator - Session data:", sessionData);

    // Update context timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new UUID message_id for unsolicited update (BPP-initiated)
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();
        console.log("Generated new UUID message_id for unsolicited update:", existingPayload.context.message_id);
    }

    // Ensure order structure exists
    if (!existingPayload.message) {
        existingPayload.message = {};
    }
    if (!existingPayload.message.order) {
        existingPayload.message.order = {};
    }

    const order = existingPayload.message.order;

    // Update order_id from session data (carry-forward from on_confirm)
    if ((sessionData as any).order_id) {
        order.id = (sessionData as any).order_id;
        console.log("Updated order.id:", (sessionData as any).order_id);
    }

    // Update provider.id if available from session data
    if (sessionData.selected_provider?.id && order.provider) {
        order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && order.items?.[0]) {
        order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    // Helper function to upsert breakup line
    function upsertBreakup(orderRef: any, title: string, value: string, currency: string = 'INR') {
        orderRef.quote = orderRef.quote || { price: { currency: 'INR', value: '0' }, breakup: [] };
        orderRef.quote.breakup = Array.isArray(orderRef.quote.breakup) ? orderRef.quote.breakup : [];
        const idx = orderRef.quote.breakup.findIndex((b: any) => (b.title || '').toUpperCase() === title.toUpperCase());
        const row = { title, price: { value, currency } };
        if (idx >= 0) orderRef.quote.breakup[idx] = row; else orderRef.quote.breakup.push(row);
    }

    // Determine update label
    const updateLabel = (sessionData as any).update_label ||
        ((sessionData as any).user_inputs?.foreclosure_amount ? 'FORECLOSURE' :
            (sessionData as any).user_inputs?.missed_emi_amount ? 'MISSED_EMI_PAYMENT' :
                (sessionData as any).user_inputs?.part_payment_amount ? 'PRE_PART_PAYMENT' : 'FORECLOSURE');

    // Ensure payments structure exists
    order.payments = order.payments || [{}];
    const payment = order.payments[0];
    payment.time = payment.time || {};
    payment.time.label = updateLabel;
    payment.params = payment.params || {};

    // Handle different update types
    if (updateLabel === 'FORECLOSURE') {
        // Add foreclosure charges to quote
        upsertBreakup(order, 'FORCLOSUER_CHARGES', '9536');

        // Calculate foreclosure amount
        const outstandingPrincipal = order.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_PRINCIPAL')?.price?.value || '139080';
        const outstandingInterest = order.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_INTEREST')?.price?.value || '0';
        const foreclosureCharges = '9536';
        const foreclosureAmount = String(parseInt(outstandingPrincipal) + parseInt(outstandingInterest) + parseInt(foreclosureCharges));

        payment.params.amount = foreclosureAmount;
        payment.params.currency = 'INR';

        const refId = sessionData.message_id || order.id || crypto.randomUUID();
        payment.url = `https://pg.icici.com/?amount=${foreclosureAmount}&ref_id=${encodeURIComponent(refId)}`;
        console.log("Foreclosure payment setup complete");
    } else if (updateLabel === 'MISSED_EMI_PAYMENT') {
        // Set installment amount for missed EMI
        payment.params.amount = '46360'; // Installment amount
        payment.params.currency = 'INR';

        const refId = sessionData.message_id || order.id || crypto.randomUUID();
        payment.url = `https://pg.icici.com/?amount=46360&ref_id=${encodeURIComponent(refId)}`;
        console.log("Missed EMI payment setup complete");
    } else if (updateLabel === 'PRE_PART_PAYMENT') {
        // Add pre payment charge
        upsertBreakup(order, 'PRE_PAYMENT_CHARGE', '4500');

        payment.params.amount = '50860'; // Installment + pre payment charge
        payment.params.currency = 'INR';

        const refId = sessionData.message_id || order.id || crypto.randomUUID();
        payment.url = `https://pg.icici.com/?amount=50860&ref_id=${encodeURIComponent(refId)}`;
        console.log("Pre part payment setup complete");
    }

    console.log("on_update_unsolicited_invoice_loan payload generated successfully");
    return existingPayload;
}
