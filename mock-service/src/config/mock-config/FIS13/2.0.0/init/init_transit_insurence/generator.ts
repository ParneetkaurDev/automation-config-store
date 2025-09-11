
export async function initGenerator(existingPayload: any, sessionData: any) {
    existingPayload.context.location.city.code= sessionData?.city_code

	if (sessionData.selected_items) {
    existingPayload.message.order.items = sessionData.selected_items;
  }
 

  if (sessionData.selected_fulfillments) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
 
  if(sessionData.user_inputs){
    const nomineeTag = existingPayload.message.order.fulfillments
			.flatMap((f: any) => f.tags || [])
			.find((t: any) => t.descriptor?.code === "NOMINEE_DETAILS");

		if (nomineeTag?.list) {
			const nomineeField = nomineeTag.list.find(
				(l: any) => l.descriptor?.code === "NOMINEE_NAME"
			);
			if (nomineeField) {
				nomineeField.value = formatName(sessionData.user_inputs.nominee_name);
			}
		}
  }
  if (sessionData.selected_provider) {
    existingPayload.message.order.provider = sessionData.selected_provider;
  }
  
  
  return existingPayload;
} 

function formatName(input: string): string {
  return input.trim().split(/\s+/).join(" | ");
}