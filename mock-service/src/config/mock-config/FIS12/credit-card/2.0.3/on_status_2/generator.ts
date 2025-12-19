import { generateTimeRangeFromContext } from "../generator-utils";

export async function onStatusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

 if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
    if (sessionData.provider_id) {
       existingPayload.message.order.provider.id = sessionData.provider_id;
  }

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
      if (sessionData.item_id) {
      item.id = sessionData.item_id;
    } 
    
  }  

  return existingPayload;
}
