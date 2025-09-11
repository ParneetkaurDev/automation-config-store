export async function initGenerator(existingPayload: any, sessionData: any) {
  existingPayload.context.location.city.code = sessionData?.city_code;

  if (sessionData.selected_items) {
    existingPayload.message.order.items = sessionData.selected_items;
  }

  if (sessionData.selected_fulfillments) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
  if (sessionData.user_inputs) {
    const nomineeInputs = sessionData.user_inputs;
    const nomineeTag = existingPayload.message.order.fulfillments
      .flatMap((f: any) => f.tags || [])
      .find((t: any) => t.descriptor?.code === "NOMINEE_DETAILS");

    nomineeTag.list.forEach((entry: any) => {
      switch (entry.descriptor?.code) {
        case "NOMINEE_NAME":
          if (nomineeInputs.nominee_name)
            entry.value = formatName(nomineeInputs.nominee_name);
          break;
        case "NOMINEE_DOB":
          if (nomineeInputs.nominee_dob)
            entry.value = ensureCountryCode(nomineeInputs.nominee_dob);
          break;
        case "APPOINTEE_NAME":
          if (nomineeInputs.apointee_name) entry.value = nomineeInputs.apointee_name;
          break;
        case "APPOINTEE_DOB":
          if (nomineeInputs.apointee_dob)
            entry.value = nomineeInputs.apointee_dob;
          break;
        case "GOOD_HEALTH_DECLARATION":
          if (nomineeInputs.health_declratation)
            entry.value = nomineeInputs.health_declratation;
          break;
      }
    });
  }

  if (sessionData.selected_provider) {
    existingPayload.message.order.provider = sessionData.selected_provider;
  }

  delete existingPayload.message.order.billing;
  return existingPayload;
}

function formatName(input: string): string {
  return input.trim().split(/\s+/).join(" | ");
}

function ensureCountryCode(phoneNumber: string): string {
  const trimmed = phoneNumber.trim();
  return trimmed.startsWith("+91") ? trimmed : "+91-" + trimmed;
}
