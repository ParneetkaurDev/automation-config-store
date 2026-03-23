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
import { injectSettlementAmount } from '../utils/settlement-utils';

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

  // Carry forward payments — merge session IDs into payload payments.
  // on_init_3 only saves ON_ORDER payment (its own default), so session.payments
  // may be missing the installments that on_confirm/default.yaml defines.
  // Strategy: use the LONGER payments array as base, then stamp any pre-generated IDs from session.
  if (existingPayload.message?.order) {
    const sessionPayments: any[] = sessionData.payments || sessionData.order?.payments || [];
    const payloadPayments: any[] = existingPayload.message.order.payments || [];

    // Build a lookup of pre-generated IDs from session keyed by payment type+label
    const sessionIdMap = new Map<string, string>();
    sessionPayments.forEach((p: any) => {
      if (p?.id && p.id.includes('_') && p.id.includes('-')) {
        const key = `${p.type}::${p.time?.label || ''}`;
        sessionIdMap.set(key, p.id);
      }
    });

    // Use whichever array is longer (payload default.yaml has all installments)
    const basePayments = payloadPayments.length >= sessionPayments.length
      ? payloadPayments
      : sessionPayments;

    existingPayload.message.order.payments = basePayments;

    if (sessionIdMap.size > 0) {
      // Stamp pre-generated IDs from on_init_3 onto matching payments to keep consistency
      let installCounter = 1;
      basePayments.forEach((payment: any) => {
        const key = `${payment.type}::${payment.time?.label || ''}`;
        if (sessionIdMap.has(key) && !payment.id?.includes('-')) {
          payment.id = sessionIdMap.get(key)!;
        }
        // For installments not yet ID-stamped via map, generate fresh IDs
        if (!payment.id || (!payment.id.includes('_') && !payment.id.includes('-'))) {
          if (payment.type === 'POST_FULFILLMENT' && payment.time?.label === 'INSTALLMENT') {
            payment.id = `installment_${installCounter}_${randomUUID()}`;
            installCounter++;
          } else if (payment.type === 'ON_ORDER') {
            payment.id = `on_order_${randomUUID()}`;
          } else if (!payment.id) {
            payment.id = `payment_${randomUUID()}`;
          }
        }
        if (payment.type === 'POST_FULFILLMENT' && payment.time?.label === 'INSTALLMENT') {
          installCounter++;
        }
      });
    }

    console.log(`✅ on_confirm: Using ${existingPayload.message.order.payments.length} payments (installments preserved)`);
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

