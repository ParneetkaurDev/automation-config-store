import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../../types";

// Required GENERAL_INFO fields for on_select
const REQUIRED_GENERAL_INFO_FIELDS = [
  "COVERAGE_AMOUNT",
  "CO_PAYMENT",
  "RESTORATION_BENEFIT",
  "CLAIM_SETTLEMENT_RATIO",
  "PRE_HOSPITALIZATION_COVERAGE_DAYS",
  "POST_HOSPITALIZATION_COVERAGE_DAYS",
  "MATERNITY_COVERAGE",
  "INITIAL_WAITING_PERIOD",
  "CASHLESS_HOSPITALS",
  "ROOM_CATEGORY",
];

export function onSelect(payload: any): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;

  console.log(`Running health insurance validations for ${domain}/${action}`);

  const results: validationOutput = [];
  const items = payload?.message?.order?.items;

  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in on_select",
    });
    return results;
  }

  // Store items in Redis for later validation
  RedisService.setKey(
    `${transaction_id}:health:onSelectItems`,
    JSON.stringify(items)
  );

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

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
