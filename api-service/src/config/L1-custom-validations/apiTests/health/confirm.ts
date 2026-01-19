import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../../types";

export function confirm(payload: any): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;

  console.log(`Running health insurance validations for ${domain}/${action}`);

  const results: validationOutput = [];
  const order = payload?.message?.order;
  const items = order?.items;
  const fulfillments = order?.fulfillments;

  // Store data in Redis for later validation
  RedisService.setKey(
    `${transaction_id}:health:confirmItems`,
    JSON.stringify(items)
  );
  RedisService.setKey(
    `${transaction_id}:health:confirmFulfillments`,
    JSON.stringify(fulfillments)
  );

  // Validate items array and xinput.form.id
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in confirm",
    });
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const xinput = item?.xinput;

      if (!xinput) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: xinput is missing`,
        });
        continue;
      }

      const form = xinput?.form;
      if (!form) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: xinput.form is missing`,
        });
        continue;
      }

      if (!form?.id) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: xinput.form.id is missing`,
        });
      }
    }
  }

  // Validate fulfillments array and id
  if (!Array.isArray(fulfillments) || fulfillments.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Fulfillments array is missing or empty in confirm",
    });
  } else {
    for (let i = 0; i < fulfillments.length; i++) {
      const fulfillment = fulfillments[i];

      if (!fulfillment?.id) {
        results.push({
          valid: false,
          code: 30000,
          description: `Fulfillment[${i}]: id is missing`,
        });
      }
    }
  }

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
