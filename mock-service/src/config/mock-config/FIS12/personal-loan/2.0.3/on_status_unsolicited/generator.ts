export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for on_status_unsolicited", sessionData);

  const submission_id = sessionData?.form_data?.Ekyc_details_form?.form_submission_id;
  console.log("form_data ------->", sessionData?.form_data?.Ekyc_details_form);

  const form_status = sessionData?.form_data?.Ekyc_details_form?.idType;
  const item = existingPayload.message.order.items[0];
  console.log("form_status", form_status);
  console.log("submission_id", submission_id);
  if (item.xinput?.form_response) {
    item.xinput.form_response.status = "APPROVED";
    if (submission_id) {

      item.xinput.form_response.submission_id = submission_id;
    }
  }

  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  // Update order ID from session data if available
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update provider information from session data
  const resolvedProviderId = sessionData.provider_id || sessionData.selected_provider?.id;
  if (resolvedProviderId) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = resolvedProviderId;
    console.log("Updated provider.id:", resolvedProviderId);
  }

  // Update item.id from session data (carry-forward from on_select_2)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }

  // Update form ID from session data (carry-forward from previous flows)
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const formId = sessionData.form_id || selectedItem?.xinput?.form?.id || "FO3";
    existingPayload.message.order.items[0].xinput.form.id = formId;
    console.log("Updated form ID:", formId);
  }

  // Update form response status - on_status_unsolicited uses APPROVED status
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    const formResponse = existingPayload.message.order.items[0].xinput.form_response;
    // if (sessionData.form_status) {
    //   formResponse.status = sessionData.form_status;
    // } else {
    //   formResponse.status = "APPROVED";
    // }

    // Update submission ID if provided
    if (sessionData.submission_id) {
      formResponse.submission_id = sessionData.submission_id;
    }
  }

  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }

  // Carry forward payments from session data (preserves dynamically generated installment IDs)
  const savedPayments = sessionData.order?.payments || sessionData.payments;
  if (Array.isArray(savedPayments) && savedPayments.length > 0 && existingPayload.message?.order) {
    existingPayload.message.order.payments = savedPayments;
    console.log("Carried forward payments from session (installment IDs preserved)");
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
      console.log("Updated quote.id from session:", sessionData.quote_id);
    }
  }

  // Update quote information if provided
  if (sessionData.quote_amount && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.price.value = sessionData.quote_amount;
  }

  // Update loan amount in items if provided
  if (sessionData.loan_amount && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].price.value = sessionData.loan_amount;
  }

  // Note: submission_id and form_response.status come from default.yaml.
  // Only override if we have a real submission_id from session form data.
  if (submission_id && existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
    console.log("Updated submission_id from kyc_verification_status:", submission_id);
  }

  return existingPayload;
}
