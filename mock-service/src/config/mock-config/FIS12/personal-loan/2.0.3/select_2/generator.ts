/**
 * Select2 Generator for FIS12 Gold Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward mapping)
 * 4. Update form_response with status and submission_id (preserve existing structure)
 */

import { randomUUID } from 'crypto';

export async function select2Generator(existingPayload: any, sessionData: any) {
  console.log("Select2 generator - Available session data:", {
    selected_provider: !!sessionData.selected_provider,
    selected_items: !!sessionData.selected_items,
    items: !!sessionData.items,
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id
  });

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("existing payloa-->", JSON.stringify(existingPayload))

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Generate a new message_id as UUID
  if (existingPayload.context) {
    existingPayload.context.message_id = randomUUID();
  }

  // Update provider.id if available from session data (carry-forward from on_search)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Determine item based on which flow we're in:
  //   AA flow (select_1 ran)      → selected_items is set → use selected_items[0]
  //   Without_AA (no select_1)    → selected_items undefined → pick bureau_personal_loan_ item
  let selectedItem: any;
  if (Array.isArray(sessionData.selected_items) && sessionData.selected_items.length > 0) {
    // AA flow — use the item select_1 already chose
    selectedItem = sessionData.selected_items[0];
    console.log("select_2: AA flow — using selected_items[0]:", selectedItem?.id);
  } else if (Array.isArray(sessionData.items) && sessionData.items.length > 0) {
    // Without_AA flow — select_1 was skipped, pick bureau item from on_search items
    const bureauItem = sessionData.items.find(
      (it: any) => it?.id && it.id.startsWith("bureau_personal_loan_")
    );
    if (bureauItem) {
      selectedItem = bureauItem;
      console.log("✅ select_2: Without_AA flow — selected bureau item:", bureauItem.id);
    } else {
      selectedItem = sessionData.item || sessionData.items[0];
      console.log("⚠️ select_2: No bureau item found, falling back to:", selectedItem?.id);
    }
  } else {
    selectedItem = sessionData.item;
    console.log("select_2: fallback to sessionData.item:", selectedItem?.id);
  }

  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    if (sessionData.selected_items_xinput) {
      sessionData.selected_items_xinput.form_response = sessionData.selected_items_xinput.form_response || {};
      sessionData.selected_items_xinput.form_response.status = "APPROVED";
      existingPayload.message.order.items[0].xinput = sessionData.selected_items_xinput;
    }
    console.log("Updated item.id:", selectedItem.id);
  }

  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }



  return existingPayload;
}

