import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../../types";

// Required GENERAL_INFO fields for on_init (includes ROOM_RENT_CAP)
const REQUIRED_GENERAL_INFO_FIELDS = [
  "COVERAGE_AMOUNT",
  "CO_PAYMENT",
  "ROOM_RENT_CAP",
  "RESTORATION_BENEFIT",
  "CLAIM_SETTLEMENT_RATIO",
  "PRE_HOSPITALIZATION_COVERAGE_DAYS",
  "POST_HOSPITALIZATION_COVERAGE_DAYS",
  "MATERNITY_COVERAGE",
  "INITIAL_WAITING_PERIOD",
  "CASHLESS_HOSPITALS",
  "ROOM_CATEGORY",
];

export function onInit(payload: any): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;

  console.log(`Running health insurance validations for ${domain}/${action}`);

  const results: validationOutput = [];
  const order = payload?.message?.order;
  const items = order?.items;
  const provider = order?.provider;
  const fulfillments = order?.fulfillments;
  const payments = order?.payments;

  // Store data in Redis for later validation
  RedisService.setKey(
    `${transaction_id}:health:onInitItems`,
    JSON.stringify(items)
  );
  RedisService.setKey(
    `${transaction_id}:health:onInitProvider`,
    JSON.stringify(provider)
  );

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in on_init",
    });
  } else {
    // Validate GENERAL_INFO tags for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      

      const tags = item?.tags;

      if (!Array.isArray(tags)) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: tags array is missing`,
        });
        continue;
      }

      // Find GENERAL_INFO tag
      const generalInfoTag = tags.find(
        (tag: any) => tag?.descriptor?.code === "GENERAL_INFO"
      );

      if (!generalInfoTag) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: GENERAL_INFO tag is missing`,
        });
        continue;
      }

      const list = generalInfoTag?.list;
      if (!Array.isArray(list)) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: GENERAL_INFO.list is missing or not an array`,
        });
        continue;
      }

      // Check for required fields
      const presentFields = list.map(
        (listItem: any) => listItem?.descriptor?.code
      );

      for (const requiredField of REQUIRED_GENERAL_INFO_FIELDS) {
        if (!presentFields.includes(requiredField)) {
          results.push({
            valid: false,
            code: 30000,
            description: `Item[${i}]: GENERAL_INFO.list.${requiredField} is missing`,
          });
        }
      }
    }
  }

  // Validate provider descriptor
  if (!provider) {
    results.push({
      valid: false,
      code: 30000,
      description: "Provider is missing in on_init",
    });
  } else {
    const descriptor = provider?.descriptor;

    if (!descriptor) {
      results.push({
        valid: false,
        code: 30000,
        description: "Provider descriptor is missing",
      });
    } else {
      // Validate required provider descriptor fields
      if (!descriptor?.name) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.name is missing",
        });
      }

      if (!descriptor?.short_desc) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.short_desc is missing",
        });
      }

      if (!descriptor?.long_desc) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.long_desc is missing",
        });
      }

      // Validate images
      const images = descriptor?.images;
      if (!Array.isArray(images) || images.length === 0) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.images is missing or empty",
        });
      } else {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          if (!image?.url) {
            results.push({
              valid: false,
              code: 30000,
              description: `Provider descriptor.images[${i}].url is missing`,
            });
          }
          if (!image?.size_type) {
            results.push({
              valid: false,
              code: 30000,
              description: `Provider descriptor.images[${i}].size_type is missing`,
            });
          }
        }
      }
    }
  }

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
