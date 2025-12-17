import { RedisService } from "ondc-automation-cache-lib";

export async function select1Generator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) existingPayload.context.timestamp = new Date().toISOString();
  console.log("sessionData-->",sessionData.session_id)
  // const data = await RedisService.getKey(sessionData.session_id)
  // console.log("data--> " + data)
  
  console.log("existingPayload-->",existingPayload)
  const submission_id = sessionData?.form_data?.consumer_information_form?.form_submission_id;

  // Map provider.id and item.id from on_search saved session if available
  const selectedProvider = sessionData.selected_provider;
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);

  if (selectedProvider?.id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = selectedProvider.id;
  }

  if (selectedItem?.id) {
    const item0 = existingPayload.message?.order?.items?.[0];
    if (item0) item0.id = selectedItem.id;
  }

  // Ensure xinput.form.id matches the one from on_search (avoid hardcoding F01)
  const formId = selectedItem?.xinput?.form?.id;
  if (formId && existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = formId;
  }

  if(existingPayload.message?.order?.items?.[0]?.xinput?.form_response){
    if (submission_id) {
      // Use the actual UUID submission_id from form service (not a static placeholder)
    existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
      console.log("Updated form_response with submission_id from form service:", submission_id);
    } else {
      console.warn("⚠️ No submission_id found for consumer_information_form - form may not have been submitted yet");
    }
  }

  return existingPayload;
}

