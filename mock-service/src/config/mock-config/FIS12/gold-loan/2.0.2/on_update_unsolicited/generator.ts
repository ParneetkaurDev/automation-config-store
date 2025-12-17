export async function onUpdateUnsolicitedDefaultGenerator(existingPayload: any, sessionData: any) {
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate new message_id for unsolicited update
  if (existingPayload.context) {
    existingPayload.context.message_id = generateUUID();
  }

  console.log("sessionData onUpdateUnsolicitedDefaultGenerator", JSON.stringify(sessionData.payments));
  // Helper function to generate UUID v4
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Load order from session data
  if (existingPayload.message) {
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    // Carry forward payments from session data (previously mapped from the flow)
    if (sessionData.payments?.length) {
      order.payments = sessionData.payments;
      console.log("Carried forward payments from sessionData.payments (installment ranges preserved)");
    }

    // Map order.id from session data (carry-forward from confirm)
    if (sessionData.order_id) {
      order.id = sessionData.order_id;
    }

    // Map provider.id from session data (carry-forward from confirm)
    if (sessionData.selected_provider?.id && order.provider) {
      order.provider.id = sessionData.selected_provider.id;
    }

    // Map item.id from session data (carry-forward from confirm)
    const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
    if (selectedItem?.id && order.items?.[0]) {
      order.items[0].id = selectedItem.id;
    }

    // Map quote.id from session data (carry-forward from confirm)
    if (sessionData.quote_id && order.quote) {
      order.quote.id = sessionData.quote_id;
    }
  }

  // Helper to upsert a breakup line
  function upsertBreakup(order: any, title: string, value: string, currency: string = 'INR') {
    order.quote = order.quote || { price: { currency: 'INR', value: '0' }, breakup: [] };
    order.quote.breakup = Array.isArray(order.quote.breakup) ? order.quote.breakup : [];
    const idx = order.quote.breakup.findIndex((b: any) => (b.title || '').toUpperCase() === title.toUpperCase());
    const row = { title, price: { value, currency } };
    if (idx >= 0) order.quote.breakup[idx] = row; else order.quote.breakup.push(row);
  }

  // Helper to remove a breakup line
  function removeBreakup(order: any, title: string) {
    if (!order.quote || !Array.isArray(order.quote.breakup)) return;
    order.quote.breakup = order.quote.breakup.filter((b: any) => 
      (b.title || '').toUpperCase() !== title.toUpperCase()
    );
  }

  // Helper to generate time range based on context timestamp
  function generateTimeRangeFromContext(contextTimestamp: string) {
    const contextDate = new Date(contextTimestamp);
    const year = contextDate.getUTCFullYear();
    const month = contextDate.getUTCMonth();
    
    // Create start of month
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    // Create end of month
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  // Helper to update payment status for specific installments
  function updatePaymentStatus(payments: any[], status: string, count?: number) {
    if (!Array.isArray(payments)) return;
    
    let updatedCount = 0;
    payments.forEach(payment => {
      if (payment.time?.label === 'INSTALLMENT' && payment.type === 'POST_FULFILLMENT') {
        if (count === undefined || updatedCount < count) {
          payment.status = status;
          updatedCount++;
        }
      }
    });
  }

  // Helper to update payment status for foreclosure
  // Based on installment index: First 2 installments → PAID, Next 3 installments → DEFERRED
  function updateForeclosurePaymentStatus(payments: any[]) {
    if (!Array.isArray(payments)) return;
    
    // Track installment index separately (only counting POST_FULFILLMENT installments)
    let installmentIndex = 0;
    
    payments.forEach(payment => {
      if (payment.time?.label === 'INSTALLMENT' && payment.type === 'POST_FULFILLMENT') {
        if (installmentIndex < 2) {
          // First 2 installments → PAID
          payment.status = 'PAID';
        } else if (installmentIndex < 5) {
          // Next 3 installments (indices 2, 3, 4) → DEFERRED
          payment.status = 'DEFERRED';
        }
        // Increment installment index
        installmentIndex++;
      }
    });
  }

  // Helper to update payment status for missed EMI
  // Based on installment index: First 2 installments → PAID, Next 3 installments → DEFERRED
  function updateMissedEMIStatus(payments: any[], contextTimestamp: string) {
    if (!Array.isArray(payments)) return;
    
    // Track installment index separately (only counting POST_FULFILLMENT installments)
    let installmentIndex = 0;
    
    payments.forEach(payment => {
      if (payment.time?.label === 'INSTALLMENT' && payment.type === 'POST_FULFILLMENT') {
        if (installmentIndex < 2) {
          // First 2 installments → PAID
          payment.status = 'PAID';
        } else if (installmentIndex < 5) {
          // Next 3 installments (indices 2, 3, 4) → DEFERRED
          payment.status = 'DEFERRED';
        }
        // Increment installment index
        installmentIndex++;
      }
    });
  }

  // Helper to update payment status for pre part payment
  // Based on installment index: First 2 installments → PAID, Next 2 installments → DEFERRED, Rest → NOT-PAID
  function updatePrePartPaymentStatus(payments: any[]) {
    if (!Array.isArray(payments)) return;
    
    // Track installment index separately (only counting POST_FULFILLMENT installments)
    let installmentIndex = 0;
    
    payments.forEach(payment => {
      if (payment.time?.label === 'INSTALLMENT' && payment.type === 'POST_FULFILLMENT') {
        if (installmentIndex < 2) {
          // First 2 installments → PAID
          payment.status = 'PAID';
        } else if (installmentIndex < 4) {
          // Next 2 installments (indices 2, 3) → DEFERRED
          payment.status = 'DEFERRED';
        } else {
          // Rest of installments → NOT-PAID
          payment.status = 'NOT-PAID';
        }
        // Increment installment index
        installmentIndex++;
      }
    });
  }

  // Helper to remove URLs from all payments (unsolicited updates should not have payment URLs)
  function removePaymentUrls(payments: any[]) {
    if (!Array.isArray(payments)) return;
    payments.forEach(payment => {
      if (payment.url) {
        delete payment.url;
      }
    });
  }

  // Branch by update label
  const orderRef = existingPayload.message?.order || {};
  const label = sessionData.update_label
    || orderRef?.payments?.[0]?.time?.label
    || sessionData.user_inputs?.foreclosure_amount && 'FORECLOSURE'
    || sessionData.user_inputs?.missed_emi_amount && 'MISSED_EMI_PAYMENT'
    || sessionData.user_inputs?.part_payment_amount && 'PRE_PART_PAYMENT'
    || 'FORECLOSURE';

  // Ensure payments structure exists - load from session first
  if (sessionData.payments?.length && !orderRef.payments?.length) {
    orderRef.payments = sessionData.payments;
    console.log("Loaded payments from sessionData.payments");
  }
  
  orderRef.payments = orderRef.payments || [{}];
  
  // For foreclosure, ensure the first payment is the foreclosure payment
  if (label === 'FORECLOSURE') {
    // Check if first payment is already a foreclosure payment
    const isFirstPaymentForeclosure = orderRef.payments[0]?.time?.label === 'FORECLOSURE' && 
                                      orderRef.payments[0]?.type === 'POST_FULFILLMENT';
    
    if (!isFirstPaymentForeclosure) {
      // Remove any existing foreclosure payment from the array
      orderRef.payments = orderRef.payments.filter((p: any) => 
        !(p.time?.label === 'FORECLOSURE' && p.type === 'POST_FULFILLMENT')
      );
      
      // Create foreclosure payment and insert at the beginning
      const foreclosurePayment = {
        id: "PAYMENT_ID_GOLD_LOAN",
        type: "POST_FULFILLMENT",
        status: "PAID",
        params: {
          amount: "0", // Will be set later in foreclosure section
          currency: "INR"
        },
        time: {
          label: "FORECLOSURE"
        }
      };
      orderRef.payments.unshift(foreclosurePayment);
      console.log("Created foreclosure payment at index 0");
    }
  }
  
  const firstPayment = orderRef.payments[0];
  firstPayment.time = firstPayment.time || {};
  firstPayment.time.label = label;

  if (label === 'MISSED_EMI_PAYMENT') {
    // Remove FORCLOSUER_CHARGES from quote breakup (should not be present for missed EMI)
    removeBreakup(orderRef, 'FORCLOSUER_CHARGES');
    
    // Set payment params for missed EMI (matching on_confirm installment amount)
    firstPayment.params = firstPayment.params || {};
    firstPayment.params.amount = "46360"; // Matches INSTALLMENT_AMOUNT from on_confirm
    firstPayment.params.currency = "INR";
    
    // Set time range based on context timestamp
    const contextTimestamp = existingPayload.context?.timestamp || new Date().toISOString();
    firstPayment.time.range = generateTimeRangeFromContext(contextTimestamp);
    
    // Update installment statuses: mark past installments as PAID, current and future as DEFERRED
    updateMissedEMIStatus(orderRef.payments, contextTimestamp);
  }

  if (label === 'FORECLOSURE') {
    // Add foreclosure charges to quote.breakup
    upsertBreakup(orderRef, 'FORCLOSUER_CHARGES', '9536');
    
    // Calculate foreclosure amount: Outstanding Principal + Outstanding Interest + Foreclosure Charges
    // From on_update_unsolicited default.yaml: OUTSTANDING_PRINCIPAL=139080, OUTSTANDING_INTEREST=0, FORCLOSUER_CHARGES=9536
    const outstandingPrincipal = orderRef.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_PRINCIPAL')?.price?.value || '139080';
    const outstandingInterest = orderRef.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_INTEREST')?.price?.value || '0';
    const foreclosureCharges = '9536';
    const foreclosureAmount = String(parseInt(outstandingPrincipal) + parseInt(outstandingInterest) + parseInt(foreclosureCharges));
    
    // Ensure first payment is POST_FULFILLMENT with FORECLOSURE label
    firstPayment.id = firstPayment.id || "PAYMENT_ID_GOLD_LOAN";
    firstPayment.type = "POST_FULFILLMENT";
    firstPayment.status = "PAID";
    firstPayment.params = firstPayment.params || {};
    firstPayment.params.amount = foreclosureAmount; // Outstanding principal + interest + charges
    firstPayment.params.currency = "INR";
    firstPayment.time = firstPayment.time || {};
    firstPayment.time.label = "FORECLOSURE";
    
    // Remove time range for foreclosure
    if (firstPayment.time.range) delete firstPayment.time.range;
    
    // Update installment statuses: first 2 installments → PAID, next 3 → DEFERRED
    // Note: This only updates POST_FULFILLMENT installments, skipping the first POST_FULFILLMENT payment
    updateForeclosurePaymentStatus(orderRef.payments);
  }
  
  if (label === 'PRE_PART_PAYMENT') {
    // Remove FORCLOSUER_CHARGES from quote breakup (should not be present for pre part payment)
    removeBreakup(orderRef, 'FORCLOSUER_CHARGES');
    
    // Add pre payment charge to quote.breakup
    upsertBreakup(orderRef, 'PRE_PAYMENT_CHARGE', '4500');
    
    // Check if first payment is already a PRE_PART_PAYMENT payment
    const isFirstPaymentPrePart = orderRef.payments[0]?.time?.label === 'PRE_PART_PAYMENT' && 
                                   orderRef.payments[0]?.type === 'POST_FULFILLMENT';
    
    if (!isFirstPaymentPrePart) {
      // Remove any existing PRE_PART_PAYMENT payment from the array
      orderRef.payments = orderRef.payments.filter((p: any) => 
        !(p.time?.label === 'PRE_PART_PAYMENT' && p.type === 'POST_FULFILLMENT')
      );
      
      // Create PRE_PART_PAYMENT payment and insert at the beginning
      const prePartPayment = {
        id: "PAYMENT_ID_GOLD_LOAN",
        type: "POST_FULFILLMENT",
        status: "PAID",
        params: {
          amount: "92720",
          currency: "INR"
        },
        time: {
          label: "PRE_PART_PAYMENT"
        }
      };
      orderRef.payments.unshift(prePartPayment);
      console.log("Created PRE_PART_PAYMENT payment at index 0");
    } else {
      // Update existing first payment
      firstPayment.id = firstPayment.id || "PAYMENT_ID_GOLD_LOAN";
      firstPayment.type = "POST_FULFILLMENT";
      firstPayment.status = "PAID";
      firstPayment.params = firstPayment.params || {};
      firstPayment.params.amount = "92720";
      firstPayment.params.currency = "INR";
      firstPayment.time = firstPayment.time || {};
      firstPayment.time.label = "PRE_PART_PAYMENT";
      if (firstPayment.time.range) delete firstPayment.time.range;
    }
    
    // Ensure ON_ORDER payment has status PAID (should be at index 1)
    const onOrderPayment = orderRef.payments.find((p: any) => p.type === 'ON_ORDER');
    if (onOrderPayment) {
      onOrderPayment.status = "PAID";
    }
    
    // Update installment statuses: first 2 → PAID, next 2 → DEFERRED, rest → NOT-PAID
    updatePrePartPaymentStatus(orderRef.payments);
  }

  // Remove all payment URLs for unsolicited update (unsolicited updates should not have payment URLs)
  if (orderRef.payments) {
    removePaymentUrls(orderRef.payments);
  }

  console.log("existingPayload onUpdateUnsolicitedDefaultGenerator", JSON.stringify(existingPayload, null, 2));
  
  return existingPayload;
}
