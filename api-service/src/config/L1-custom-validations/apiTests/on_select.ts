import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../types";
import { has } from "lodash";

async function validateFulfillments(
    payload: Record<string, any>
  ): Promise<boolean> {
    
    let flag = true
    const hasTicket = payload?.message?.order?.fulfillments.some((f:any) => f.type === "TICKET")
    if(!hasTicket){
        flag = false
    }
    return flag;
  }
export function onSelect(payload: any): validationOutput {
  // Extract payload, context, domain and action

  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;
  const items = payload?.message?.items;
  const quote = payload?.message?.order?.quote;
  const fulfillments = payload?.message?.order?.fulfillments;
  console.log(`Running validations for ${domain}/${action}`);

  // Initialize results array
  const results: validationOutput = [];

  RedisService.setKey(
    `${transaction_id}:onSelectQuote`,
    JSON.stringify({ quote })
  );

  RedisService.setKey(
    `${transaction_id}:onSelectItems`,
    JSON.stringify({ items })
  );

  RedisService.setKey(
    `${transaction_id}:onSelectFulfillments`,
    JSON.stringify({ fulfillments })
  );
  
  const validFulfillments = validateFulfillments(payload);

  if(!validFulfillments){
    results.push({
        valid: false,
        code: 63002,
        description: `The fulfillment object should have a Ticket Object`,
      });
  }
  // If no issues found, return a success result
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
