export async function cancelGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for status", sessionData);
  
  if (existingPayload.context?.transaction_id) {
    existingPayload.message = existingPayload.message || {};
    delete existingPayload.message.transaction_id;
  } 
  
  return existingPayload;
}
