/**
 * On Confirm Generator for FIS12 Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Generate order.id (first time order ID is created)
 * 4. Update provider.id and item.id from session data (carry-forward mapping)
 * 5. Update customer information in fulfillments from session data
 * 6. Carry forward payments from session and generate unique installment IDs
 */

import { randomUUID } from 'crypto';
import { injectSettlementAmount } from '../settlement-utils';

export async function onConfirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_confirm", sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Use the same message_id as confirm (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from confirm:", sessionData.message_id);
  }

  // Generate order.id (first time order ID is created in the flow)
  if (existingPayload.message?.order) {
    existingPayload.message.order.id = `LOAN_ORDER_${Date.now()}_${sessionData.transaction_id?.slice(-8) || 'DEFAULT'}`;
    console.log("Generated order.id:", existingPayload.message.order.id);
  }

  // Update provider.id if available from session data (carry-forward from confirm)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from confirm)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }

  // Update location_ids from session data (carry-forward from previous flows)
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }

  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }

  // Update customer contact information if available from session data
  if (sessionData.customer_phone && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.phone = sessionData.customer_phone;
    console.log("Updated customer phone:", sessionData.customer_phone);
  }

  if (sessionData.customer_email && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.email = sessionData.customer_email;
    console.log("Updated customer email:", sessionData.customer_email);
  }

  // Update fulfillment state to DISBURSED (loan has been confirmed and disbursed)
  if (existingPayload.message?.order?.fulfillments?.[0]?.state?.descriptor) {
    existingPayload.message.order.fulfillments[0].state.descriptor.name = "Loan Disbursed";
    console.log("Updated fulfillment state to DISBURSED");
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    const sessionQuoteId =
      sessionData?.quote_id ||
      sessionData?.quote?.id ||
      sessionData?.order?.quote?.id;

    if (sessionQuoteId) {
      existingPayload.message.order.quote.id = sessionQuoteId;
      console.log("Updated quote.id from session:", sessionQuoteId);
    }
  }

  // Carry forward payments from session data (like GL 2.0.2)
  if (existingPayload.message?.order) {
    const savedPayments =
      sessionData.order?.payments ||
      sessionData.payments;

    if (Array.isArray(savedPayments) && savedPayments.length > 0) {
      existingPayload.message.order.payments = savedPayments;
      console.log("Carried forward payments from session (installment ranges preserved)");
    } else {
      console.warn("No saved payments found in session; using payload defaults");
    }

    // Generate unique IDs for ALL payments to enable tracking across flows
    if (Array.isArray(existingPayload.message.order.payments)) {
      const contextDate = existingPayload.context?.timestamp
        ? new Date(existingPayload.context.timestamp)
        : new Date();

      // First installment starts next month
      const base = new Date(Date.UTC(contextDate.getUTCFullYear(), contextDate.getUTCMonth() + 1, 1));

      const setMonthRange = (baseDate: Date, monthOffset: number) => {
        const start = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + monthOffset, 1));
        const end = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + monthOffset + 1, 0, 23, 59, 59, 999));
        return { start: start.toISOString(), end: end.toISOString() };
      };

      let installmentIndex = 0;
      let installmentCounter = 1;

      existingPayload.message.order.payments.forEach((payment: any) => {
        // Update installment date ranges
        if (payment?.type === "POST_FULFILLMENT" && payment?.time?.range) {
          const range = setMonthRange(base, installmentIndex);
          payment.time.range.start = range.start;
          payment.time.range.end = range.end;
          installmentIndex += 1;
          console.log(`Updated installment #${installmentIndex} range:`, range);
        }

        // Skip if payment already has a unique ID
        if (payment.id && payment.id.includes('_') && payment.id.includes('-')) {
          return;
        }

        // Generate unique IDs based on payment type
        if (payment.type === 'POST_FULFILLMENT' && payment.time?.label === 'INSTALLMENT') {
          payment.id = `installment_${installmentCounter}_${randomUUID()}`;
          console.log(`Generated unique installment ID: ${payment.id}`);
          installmentCounter++;
        } else if (payment.type === 'ON_ORDER') {
          payment.id = `on_order_${randomUUID()}`;
          console.log(`Generated unique on-order payment ID: ${payment.id}`);
        } else if (payment.time?.label === 'MISSED_EMI_PAYMENT') {
          payment.id = `missed_emi_${randomUUID()}`;
          console.log(`Generated unique missed EMI payment ID: ${payment.id}`);
        } else if (payment.time?.label === 'PRE_PART_PAYMENT') {
          payment.id = `pre_part_${randomUUID()}`;
          console.log(`Generated unique pre-part payment ID: ${payment.id}`);
        } else if (payment.time?.label === 'FORECLOSURE') {
          payment.id = `foreclosure_${randomUUID()}`;
          console.log(`Generated unique foreclosure payment ID: ${payment.id}`);
        } else if (!payment.id) {
          payment.id = `payment_${randomUUID()}`;
          console.log(`Generated unique payment ID: ${payment.id}`);
        }
      });
    }
  }

  // Set created_at and updated_at to current timestamp
  if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    existingPayload.message.order.created_at = now;
    existingPayload.message.order.updated_at = now;
    console.log("Set order.created_at and order.updated_at to:", now);
  }

  // Dynamically inject SETTLEMENT_AMOUNT derived from BAP_TERMS fee data
  injectSettlementAmount(existingPayload, sessionData);

  return existingPayload;
}

