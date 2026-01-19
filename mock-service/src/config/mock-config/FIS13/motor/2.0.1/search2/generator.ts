import { SessionData } from "../../../session-types";

export async function searchDefaultGenerator(
	existingPayload: any,
	sessionData: SessionData
) {
	// Remove BPP context fields (not needed in search)
	delete existingPayload.context.bpp_uri;
	delete existingPayload.context.bpp_id;

	// Set city code from user inputs if available
	if (sessionData.user_inputs?.city_code) {
		existingPayload.context.location.city.code = sessionData.user_inputs.city_code;
	}

	// Get vehicle_details_form submission_id from session data
	const submissionId = sessionData.form_data?.vehicle_details_form?.form_submission_id
		|| sessionData.vehicle_details_form;


	// Update the form_response submission_id in the payload
	if (submissionId && existingPayload.message?.intent?.provider?.items?.[0]?.xinput?.form_response) {
		existingPayload.message.intent.provider.items[0].xinput.form_response.submission_id = submissionId;
	}


	return existingPayload;
} 