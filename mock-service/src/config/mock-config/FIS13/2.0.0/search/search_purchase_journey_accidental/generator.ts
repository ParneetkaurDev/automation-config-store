import { SessionData } from "../../../session-types";

export async function search_purchase_journey_accidental_generator(
	existingPayload: any,
	sessionData: SessionData
) {
	delete existingPayload.context.bpp_uri;
	delete existingPayload.context.bpp_id;

	const now = new Date();
	const end = new Date(now);
	end.setDate(now.getDate() + 2);
	if (sessionData.user_inputs) {
		const buyerInputs = sessionData.user_inputs;
		const items = existingPayload.message?.intent?.provider?.items || [];

		if (items.length > 0) {
			const tags = items[0].tags?.find(
				(t: any) => t.descriptor?.code === "BAP_INPUTS"
			);

			if (tags?.list) {
				tags.list.forEach((entry: any) => {
					switch (entry.descriptor?.code) {
						case "BUYER_NAME":
							if (buyerInputs.buyer_name)
								entry.value = formatName(buyerInputs.buyer_name)
							break;
						case "BUYER_PHONE_NUMBER":
							if (buyerInputs.phone_number) 
								entry.value = ensureCountryCode(buyerInputs.phone_number)
							break;
						case "BUYER_PAN_NUMBER":
							if (buyerInputs.pan_number)
								entry.value = buyerInputs.pan_number;
							break;
						case "BUYER_DOB":
							if (buyerInputs.dob)
								entry.value = buyerInputs.dob;
							break;
						case "BUYER_GENDER":
							if (buyerInputs.gender)
								entry.value = buyerInputs.gender;
							break;
						case "SUM_INSURED":
							if (buyerInputs.sum_insured)
								entry.value = buyerInputs.sum_insured;
							break;
						case "BUYER_EMAIL":
							if (buyerInputs.email)
								entry.value = buyerInputs.email;
							break;
					}
				});
			}
		}
	}

	if (
		existingPayload.message?.intent?.fulfillment?.stops?.[0]?.time?.range
	) {
		existingPayload.message.intent.fulfillment.stops[0].time.range.start = now.toISOString();
		existingPayload.message.intent.fulfillment.stops[0].time.range.end = end.toISOString();
	}

	if (sessionData.user_inputs?.city_code) {
		existingPayload.context.location.city.code = sessionData.user_inputs.city_code;
	}

	return existingPayload;
} 

function formatName(input: string): string {
  return input.trim().split(/\s+/).join(' | ');
}

function ensureCountryCode(phoneNumber: string): string {
  const trimmed = phoneNumber.trim();
  return trimmed.startsWith('+91') ? trimmed : '+91-' + trimmed;
}