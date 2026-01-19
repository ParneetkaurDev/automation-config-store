import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../types";
const isEmpty = (obj: any) =>
  obj == null || (typeof obj === "object" && Object.keys(obj).length === 0);
async function validateBilling(
  payload: Record<string, any>
): Promise<boolean> {
  
  const transaction_id = payload.context.transaction_id
  let flag = true
  let initBilling: any = await RedisService.getKey(
    `${transaction_id}:onInitFulfillments`
  );
  if (isEmpty(initBilling) && !isEmpty(payload?.message?.order?.billing)) {
    flag = false;
  }
  return flag;
}

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
export function onInit(payload: any): validationOutput {
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
    `${transaction_id}:onInitQuote`,
    JSON.stringify({ quote })
  );

  RedisService.setKey(
    `${transaction_id}:onInitItems`,
    JSON.stringify({ items })
  );

  RedisService.setKey(
    `${transaction_id}:onInitFulfillments`,
    JSON.stringify({ fulfillments })
  );
  const validFulfillments = validateFulfillments(payload);
  const validBilling = validateBilling(payload)
  if(!validFulfillments){
    results.push({
        valid: false,
        code: 63002,
        description: `The fulfillment object should have a Ticket Object`,
      });
  }
  if(!validBilling){
    results.push({
        valid: false,
        code: 63002,
        description: `Billing object is incorrect`,
      });
  }
  // If no issues found, return a success result
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
