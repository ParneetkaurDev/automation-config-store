import { randomUUID } from 'crypto';

export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for on_status_unsolicited", sessionData);

  const submission_id = sessionData?.form_data?.Ekyc_details_form_cc?.form_submission_id;
  console.log("form_data ------->", sessionData?.form_data?.Ekyc_details_form_cc);
  // 
  // const form_status = sessionData?.form_data?.Ekyc_details_form_cc?.idType;

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Generate UNIQUE message_id for unsolicited response (must NOT reuse previous message_id)
  if (existingPayload.context) {
    existingPayload.context.message_id = randomUUID();
    console.log("Generated unique message_id for unsolicited:", existingPayload.context.message_id);
  }

  // Update order ID from session data if available
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
    console.log("Updated order.id from session:", sessionData.order_id);
  }

  // Update provider information from session data (carry-forward)
  if (sessionData.provider_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = sessionData.provider_id;
  } else if (sessionData.selected_provider?.id) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
  }

  // Update item.id from session data (carry-forward)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }

  // Update form ID from session data (carry-forward, not hardcoded)
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const formId = sessionData.form_id || selectedItem?.xinput?.form?.id || "FO3";
    existingPayload.message.order.items[0].xinput.form.id = formId;
    console.log("Updated form ID from session:", formId);
  }

  // Update form response with submission_id and status
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    const formResponse = existingPayload.message.order.items[0].xinput.form_response;

    // Set form_response status from form submission
    // if (form_status) {
    //   formResponse.status = form_status;
    //   console.log("Updated form_response.status:", form_status);
    // }

    // Set submission_id from form submission
    if (submission_id) {
      formResponse.submission_id = submission_id;
      console.log("Updated form_response.submission_id:", submission_id);
    }
  }

  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    const quoteId = sessionData?.quote_id || sessionData?.order?.quote?.id;
    if (quoteId) {
      existingPayload.message.order.quote.id = quoteId;
      console.log("Updated quote.id from session:", quoteId);
    }
  }

  // // Set created_at and updated_at to current timestamp
  // if (existingPayload.message?.order) {
  //   const now = new Date().toISOString();
  //   existingPayload.message.order.created_at = now;
  //   existingPayload.message.order.updated_at = now;
  //   console.log("Set order.created_at and order.updated_at to:", now);
  // }

  return existingPayload;
}
