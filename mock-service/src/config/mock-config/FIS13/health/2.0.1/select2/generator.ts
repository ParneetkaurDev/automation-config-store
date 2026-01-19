

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Select generator - Available session data:", {
    selected_provider: !!sessionData.selected_provider,
    selected_items: !!sessionData.selected_items,
    items: !!sessionData.items,
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id
  });

   const submission_id = sessionData?.form_data?.verification_status?.form_submission_id || sessionData?.verification_status
  const form_status = sessionData?.form_data?.verification_status?.idType;

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate new UUID message_id for init (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
  }
  
  
  // Update provider.id if available from session data (carry-forward from on_search)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }
  
  // Update item.id if available from session data (carry-forward from on_search)
  // if (sessionData.items && Array.isArray(sessionData.items) && sessionData.items.length > 0) {
  //   const selectedItem = sessionData.items[0];
  //   if (existingPayload.message?.order?.items?.[0]) {
  //     existingPayload.message.order.items[0].id = selectedItem.id;
  //     console.log("Updated item.id:", selectedItem.id);
  //   }
  // }

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      const formId = sessionData.form_id || "FO4";
      item.xinput.form.id = formId;
      console.log("Updated form ID:", formId);
    }
    
    // Set form status and submission_id
    if (item.xinput) {
      // Create form_response if it doesn't exist
      if (!item.xinput.form_response) {
        item.xinput.form_response = {};
      }
      if (form_status) {
        item.xinput.form_response.status = form_status;
      }
      if (submission_id) {
        item.xinput.form_response.submission_id = submission_id;
      }
      console.log("Updated form_response:", item.xinput.form_response);
    }
  }
  
  
  // // Update form_response with status and submission_id (preserve existing structure)
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
  //   existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
  //   existingPayload.message.order.items[0].xinput.form_response.submission_id = `F01_SUBMISSION_ID_${Date.now()}`;
  //   console.log("Updated form_response with status and submission_id");
  // }
  
  return existingPayload;
} 