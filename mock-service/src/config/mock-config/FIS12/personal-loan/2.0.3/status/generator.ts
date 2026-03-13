export async function statusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for status", sessionData);

  // Map order_id from session data (generated in on_confirm)
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order_id = sessionData.order_id;
    console.log("Updated order_id from session:", sessionData.order_id);
  }

  // Set ref_id from transaction_id
  if (existingPayload.context?.transaction_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.ref_id = existingPayload.context.transaction_id;
    delete existingPayload.message.transaction_id;
  }

  return existingPayload;
}

