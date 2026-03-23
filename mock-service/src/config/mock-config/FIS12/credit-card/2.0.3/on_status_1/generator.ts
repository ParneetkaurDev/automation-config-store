export async function onStatusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for on_status_1", sessionData);

  const submission_id = sessionData?.form_data?.Ekyc_details_form_cc?.form_submission_id;

  const form_status = sessionData?.form_data?.Ekyc_details_form_cc?.idType;
  console.log("Ekyc form submission_id:", submission_id);
  console.log("Ekyc form status:", form_status);

  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  // Update order.id from session data (carry-forward from on_confirm)
  if (sessionData.order_id && existingPayload.message?.order) {
    existingPayload.message.order.id = sessionData.order_id;
    console.log("Updated order.id from session:", sessionData.order_id);
  }

  // Update provider information from session data (carry-forward from previous flows)
  if (sessionData.provider_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = sessionData.provider_id;
  } else if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
  }

  if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];

    const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
    if (selectedItem?.id) {
      item.id = selectedItem.id;
      console.log("Updated item.id from session:", selectedItem.id);
    }

    const selectedLocationId = sessionData.selected_location_id;
    if (selectedLocationId) {
      item.location_ids = [selectedLocationId];
      console.log("Updated location_ids:", selectedLocationId);
    }
    if (item.xinput?.form) {
      const formId = sessionData.form_id || selectedItem?.xinput?.form?.id || crypto.randomUUID();
      item.xinput.form.id = formId;
      console.log("Updated form ID from session:", formId);
    }

    if (item.xinput?.form_response) {
      if (form_status) {
        item.xinput.form_response.status = form_status;
      }
      if (submission_id) {
        item.xinput.form_response.submission_id = submission_id;
      }
    }
  }

  if (existingPayload.message?.order?.quote) {
    const quoteId = sessionData?.quote_id || sessionData?.order?.quote?.id;
    if (quoteId) {
      existingPayload.message.order.quote.id = quoteId;
      console.log("Updated quote.id from session:", quoteId);
    }
  }

  if (existingPayload.message?.order?.fulfillments) {
    existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
      delete fulfillment.customer;
      delete fulfillment.state;
    });
  }

  // Remove documents section completely
  if (existingPayload.message?.order?.documents) {
    delete existingPayload.message.order.documents;
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
