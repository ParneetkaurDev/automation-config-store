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
      delete entry.descriptor?.short_desc
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
          if (nomineeInputs.appointee_name) entry.value = nomineeInputs.appointee_name;
          break;
        case "APPOINTEE_RELATIONSHIP":
          if (nomineeInputs.appointee_relation)
            entry.value = nomineeInputs.appointee_relation;
          break;
        case "GOOD_HEALTH_DECLARATION":
          if (nomineeInputs.health_declaration)
            entry.value = nomineeInputs.health_declaration;
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
