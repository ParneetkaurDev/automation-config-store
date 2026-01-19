import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "../../types";

// Required VAHAN_DETAILS fields
const REQUIRED_VAHAN_DETAILS_FIELDS = [
  "MODEL",
  "MAKE",
  "FUEL_TYPE",
  "VARIANT",
  "REGISTERED_CITY",
  "REGISTERED_DATE",
  "CHASSIS_NUMBER",
  "ENGINE_NUMBER",
  "PREVIOUS_POLICY_NUMBER",
  "PREVIOUS_INSURER",
  "PREVIOUS_POLICY_END_DATE",
];

export function onInit(payload: any): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;
  const transaction_id = context?.transaction_id;

  console.log(`Running motor insurance validations for ${domain}/${action}`);

  const results: validationOutput = [];
  const order = payload?.message?.order;
  const items = order?.items;
  const fulfillments = order?.fulfillments;
  const payments = order?.payments;

  // Store data in Redis for later validation
  if (items) {
    RedisService.setKey(
      `${transaction_id}:motor:onInitItems`,
      JSON.stringify(items)
    );
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in on_init",
    });
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Validate fulfillment_ids
      if (!item?.fulfillment_ids || !Array.isArray(item.fulfillment_ids) || item.fulfillment_ids.length === 0) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: fulfillment_ids is missing or empty`,
        });
      }

      const tags = item?.tags;

      if (!Array.isArray(tags)) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: tags array is missing`,
        });
        continue;
      }

      // Validate GENERAL_INFO tag with IDV_VALUE
      const generalInfoTag = tags.find(
        (tag: any) => tag?.descriptor?.code === "GENERAL_INFO"
      );

      if (!generalInfoTag) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: GENERAL_INFO tag is missing`,
        });
      } else {
        const list = generalInfoTag?.list;
        if (!Array.isArray(list)) {
          results.push({
            valid: false,
            code: 30000,
            description: `Item[${i}]: GENERAL_INFO.list is missing or not an array`,
          });
        } else {
          const presentFields = list.map(
            (listItem: any) => listItem?.descriptor?.code
          );
          if (!presentFields.includes("IDV_VALUE")) {
            results.push({
              valid: false,
              code: 30000,
              description: `Item[${i}]: GENERAL_INFO.list.IDV_VALUE is missing`,
            });
          }
        }
      }

      // Validate VAHAN_DETAILS tag
      const vahanDetailsTag = tags.find(
        (tag: any) => tag?.descriptor?.code === "VAHAN_DETAILS"
      );

      if (!vahanDetailsTag) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: VAHAN_DETAILS tag is missing`,
        });
      } else {
        const vahanList = vahanDetailsTag?.list;
        if (!Array.isArray(vahanList)) {
          results.push({
            valid: false,
            code: 30000,
            description: `Item[${i}]: VAHAN_DETAILS.list is missing or not an array`,
          });
        } else {
          const presentVahanFields = vahanList.map(
            (listItem: any) => listItem?.descriptor?.code
          );

          for (const requiredField of REQUIRED_VAHAN_DETAILS_FIELDS) {
            if (!presentVahanFields.includes(requiredField)) {
              results.push({
                valid: false,
                code: 30000,
                description: `Item[${i}]: VAHAN_DETAILS.list.${requiredField} is missing`,
              });
            }
          }
        }
      }
    }
  }

  // Validate fulfillments
  if (!Array.isArray(fulfillments) || fulfillments.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Fulfillments array is missing or empty in on_init",
    });
  } else {
    for (let i = 0; i < fulfillments.length; i++) {
      const fulfillment = fulfillments[i];

      // Validate customer.person.name
      if (!fulfillment?.customer?.person?.name) {
        results.push({
          valid: false,
          code: 30000,
          description: `Fulfillment[${i}]: customer.person.name is missing`,
        });
      }

      // Validate state.descriptor.name
      if (!fulfillment?.state?.descriptor?.name) {
        results.push({
          valid: false,
          code: 30000,
          description: `Fulfillment[${i}]: state.descriptor.name is missing`,
        });
      }

      // Validate state.descriptor.code
      if (!fulfillment?.state?.descriptor?.code) {
        results.push({
          valid: false,
          code: 30000,
          description: `Fulfillment[${i}]: state.descriptor.code is missing`,
        });
      }
    }
  }

  // Validate payments
  if (!Array.isArray(payments) || payments.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Payments array is missing or empty in on_init",
    });
  } else {
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];

      // Validate params.amount
      if (!payment?.params?.amount) {
        results.push({
          valid: false,
          code: 30000,
          description: `Payment[${i}]: params.amount is missing`,
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
