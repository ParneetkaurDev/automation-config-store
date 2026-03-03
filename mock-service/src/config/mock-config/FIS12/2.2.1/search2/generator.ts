import { SessionData } from "../../session-types";

export async function searchDefaultGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  // Remove BPP context fields (not needed in search)
  delete existingPayload.context.bpp_uri;
  delete existingPayload.context.bpp_id;

  // Set city code from user inputs if available
  if (sessionData.user_inputs?.city_code) {
    existingPayload.context.location.city.code =
      sessionData.user_inputs.city_code;
  }

  if (sessionData.user_inputs && sessionData.user_inputs?.provider) {
    existingPayload.message.intent.provider = sessionData.user_inputs?.provider
  }

  // Update form_response with status and submission_id (preserve existing structure)
  if (
    existingPayload.message?.intent?.provider?.items?.[0]?.xinput?.form_response
  ) {
    existingPayload.message.intent.provider.items[0].xinput.form.id =
      "product_details_form";
    existingPayload.message.intent.provider.items[0].xinput.form_response.status =
      "SUCCESS";
    existingPayload.message.intent.provider.items[0].xinput.form_response.submission_id =
      sessionData.product_details_form;
    console.log("Updated form_response with status and submission_id");
  }

  console.log(
    "sessionData.message_id in search generator",
    sessionData.message_id
  );

  return existingPayload;
}
