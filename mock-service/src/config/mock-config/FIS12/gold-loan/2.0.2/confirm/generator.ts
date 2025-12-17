/**
 * Confirm Generator for FIS12 Gold Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and correct action
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Generate or update provider.id, item.id, and quote.id with gold_loan_ prefix
 * 4. Preserve existing structure from default.yaml
 */

import { randomUUID } from 'crypto';

export async function confirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for confirm", sessionData);
  
  // Update context timestamp and action
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
    existingPayload.context.action = "confirm";
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate new UUID message_id for confirm (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = randomUUID();
    console.log("Generated new UUID message_id for confirm:", existingPayload.context.message_id);
  }
  
  // Generate or update provider.id with gold_loan_ prefix
  if (existingPayload.message?.order?.provider) {
    if (sessionData.selected_provider?.id) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
      console.log("Updated provider.id from session:", sessionData.selected_provider.id);
    } else if (!existingPayload.message.order.provider.id || 
               existingPayload.message.order.provider.id === "PROVIDER_ID" ||
               existingPayload.message.order.provider.id.startsWith("PROVIDER_ID")) {
      existingPayload.message.order.provider.id = `gold_loan_${randomUUID()}`;
      console.log("Generated provider.id:", existingPayload.message.order.provider.id);
    }
  }
  
  // Generate or update item.id with gold_loan_ prefix
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (existingPayload.message?.order?.items?.[0]) {
    if (selectedItem?.id) {
    existingPayload.message.order.items[0].id = selectedItem.id;
      console.log("Updated item.id from session:", selectedItem.id);
    } else if (!existingPayload.message.order.items[0].id || 
               existingPayload.message.order.items[0].id === "ITEM_ID_GOLD_LOAN_1" ||
               existingPayload.message.order.items[0].id === "ITEM_ID_GOLD_LOAN_2" ||
               existingPayload.message.order.items[0].id.startsWith("ITEM_ID_GOLD_LOAN")) {
      existingPayload.message.order.items[0].id = `gold_loan_${randomUUID()}`;
      console.log("Generated item.id:", existingPayload.message.order.items[0].id);
    }
  }
  
  // Generate or update quote.id with gold_loan_ prefix
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
      console.log("Updated quote.id from session:", sessionData.quote_id);
    } else if (!existingPayload.message.order.quote.id || 
               existingPayload.message.order.quote.id === "LOAN_LEAD_ID_OR_SIMILAR" ||
               existingPayload.message.order.quote.id.startsWith("LOAN_LEAD_ID")) {
      existingPayload.message.order.quote.id = `gold_loan_${randomUUID()}`;
      console.log("Generated quote.id:", existingPayload.message.order.quote.id);
    }
  }

  return existingPayload;
}
