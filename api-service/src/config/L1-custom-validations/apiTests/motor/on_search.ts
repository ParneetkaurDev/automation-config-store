import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../../types";

export function onSearch(payload: any): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;

  console.log(`Running motor insurance validations for ${domain}/${action}`);

  const results: validationOutput = [];
  const catalog = payload?.message?.catalog;

  // Store catalog in Redis for later validation
  if (catalog) {
    RedisService.setKey(
      `${transaction_id}:motor:onSearchCatalog`,
      JSON.stringify(catalog)
    );
  }

  // Validate catalog descriptor name
  if (!catalog) {
    results.push({
      valid: false,
      code: 30000,
      description: "Catalog is missing in on_search",
    });
  } else {
    const descriptorName = catalog?.descriptor?.name;
    if (!descriptorName) {
      results.push({
        valid: false,
        code: 30000,
        description: "catalog.descriptor.name is missing",
      });
    }
  }

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
