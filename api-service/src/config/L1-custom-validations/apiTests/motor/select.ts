import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../../types";

export function select(payload: any): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;

  console.log(`Running motor insurance validations for ${domain}/${action}`);

  const results: validationOutput = [];
  const items = payload?.message?.order?.items;

  // Store items in Redis for later validation
  if (items) {
    RedisService.setKey(
      `${transaction_id}:motor:selectItems`,
      JSON.stringify(items)
    );
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in select",
    });
    return results;
  }

  // Validate each item
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

    // Check for IDV_SELECTED field
    const presentFields = list.map(
      (listItem: any) => listItem?.descriptor?.code
    );

    if (!presentFields.includes("IDV_SELECTED")) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${i}]: GENERAL_INFO.list.IDV_SELECTED is missing`,
      });
    }
  }

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
