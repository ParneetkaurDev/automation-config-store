import { validationOutput } from "../../types";

// Required context fields
const REQUIRED_CONTEXT_FIELDS = [
  "domain",
  "action",
  "timestamp",
  "transaction_id",
  "message_id",
  "version",
  "bap_id",
  "bap_uri",
  "bpp_id",
  "bpp_uri",
  "ttl",
];

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

// Helper function to validate context fields
function validateContext(payload: any, results: validationOutput): void {
  const context = payload?.context;

  if (!context) {
    results.push({
      valid: false,
      code: 30000,
      description: "Context is missing",
    });
    return;
  }

  // Validate required context fields
  for (const field of REQUIRED_CONTEXT_FIELDS) {
    if (!context[field]) {
      results.push({
        valid: false,
        code: 30000,
        description: `context.${field} is missing`,
      });
    }
  }

  // Validate location.country.code
  if (!context?.location?.country?.code) {
    results.push({
      valid: false,
      code: 30000,
      description: "context.location.country.code is missing",
    });
  }

  // Validate location.city.code
  if (!context?.location?.city?.code) {
    results.push({
      valid: false,
      code: 30000,
      description: "context.location.city.code is missing",
    });
  }
}

// Helper function to validate provider fields
function validateProvider(payload: any, results: validationOutput): void {
  const provider = payload?.message?.order?.provider;

  if (!provider) {
    results.push({
      valid: false,
      code: 30000,
      description: "Provider is missing",
    });
    return;
  }

  // Validate provider.id
  if (!provider?.id) {
    results.push({
      valid: false,
      code: 30000,
      description: "provider.id is missing",
    });
  }

  // Validate provider.descriptor
  const descriptor = provider?.descriptor;
  if (!descriptor) {
    results.push({
      valid: false,
      code: 30000,
      description: "provider.descriptor is missing",
    });
  } else {
    if (!descriptor?.name) {
      results.push({
        valid: false,
        code: 30000,
        description: "provider.descriptor.name is missing",
      });
    }

    if (!descriptor?.short_desc) {
      results.push({
        valid: false,
        code: 30000,
        description: "provider.descriptor.short_desc is missing",
      });
    }

    if (!descriptor?.long_desc) {
      results.push({
        valid: false,
        code: 30000,
        description: "provider.descriptor.long_desc is missing",
      });
    }

    // Validate images
    const images = descriptor?.images;
    if (!Array.isArray(images) || images.length === 0) {
      results.push({
        valid: false,
        code: 30000,
        description: "provider.descriptor.images is missing or empty",
      });
    } else {
      for (let i = 0; i < images.length; i++) {
        if (!images[i]?.url) {
          results.push({
            valid: false,
            code: 30000,
            description: `provider.descriptor.images[${i}].url is missing`,
          });
        }
      }
    }
  }
}

// Helper function to validate basic item fields
function validateBasicItemFields(item: any, itemIndex: number, results: validationOutput): void {
  // Validate item.id
  if (!item?.id) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: id is missing`,
    });
  }

  // Validate item.parent_item_id
  if (!item?.parent_item_id) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: parent_item_id is missing`,
    });
  }

  // Validate item.descriptor
  if (!item?.descriptor?.name) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: descriptor.name is missing`,
    });
  }

  if (!item?.descriptor?.short_desc) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: descriptor.short_desc is missing`,
    });
  }

  // Validate item.price
  if (!item?.price?.value) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: price.value is missing`,
    });
  }

  if (!item?.price?.currency) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: price.currency is missing`,
    });
  }

  // Validate item.time
  if (!item?.time?.duration) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: time.duration is missing`,
    });
  }

  if (!item?.time?.label) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: time.label is missing`,
    });
  }
}

export function onStatus(payload: any, previousAction: string | null = null): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;

  console.log(`Running motor insurance validations for ${domain}/${action}`);
  console.log(`Previous action was: ${previousAction}`);

  // If previous action was on_select, apply on_select validations
  if (previousAction === "on_select") {
    return validateAsOnSelect(payload);
  }

  // If previous action was on_init, apply on_init validations
  if (previousAction === "on_init") {
    return validateAsOnInit(payload);
  }

  // Default: apply on_status validations
  return validateAsOnStatus(payload);
}

// Apply on_select validations
function validateAsOnSelect(payload: any): validationOutput {
  console.log("Applying on_select validations for on_status (previous action: on_select)");

  const results: validationOutput = [];

  // Validate context
  validateContext(payload, results);

  // Validate provider
  validateProvider(payload, results);

  const items = payload?.message?.order?.items;

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in on_select",
    });
    return results;
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Validate basic item fields
    validateBasicItemFields(item, i, results);

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
      continue;
    }

    const vahanList = vahanDetailsTag?.list;
    if (!Array.isArray(vahanList)) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${i}]: VAHAN_DETAILS.list is missing or not an array`,
      });
      continue;
    }

    // Check for required VAHAN_DETAILS fields
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

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}

// Apply on_init validations
function validateAsOnInit(payload: any): validationOutput {
  console.log("Applying on_init validations for on_status (previous action: on_init)");

  const results: validationOutput = [];

  // Validate context
  validateContext(payload, results);

  // Validate provider
  validateProvider(payload, results);

  const order = payload?.message?.order;
  const items = order?.items;
  const fulfillments = order?.fulfillments;
  const payments = order?.payments;

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

      // Validate basic item fields
      validateBasicItemFields(item, i, results);

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

// Default on_status validations
function validateAsOnStatus(payload: any): validationOutput {
  console.log("Applying default on_status validations");

  const results: validationOutput = [];

  // Validate context
  validateContext(payload, results);

  // Validate provider
  validateProvider(payload, results);

  const order = payload?.message?.order;
  const items = order?.items;
  const quote = order?.quote;

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty in on_status",
    });
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Validate basic item fields
      validateBasicItemFields(item, i, results);

      // Validate add_ons
      const addOns = item?.add_ons;
      if (Array.isArray(addOns) && addOns.length > 0) {
        for (let j = 0; j < addOns.length; j++) {
          const addOn = addOns[j];

          if (!addOn?.id) {
            results.push({
              valid: false,
              code: 30000,
              description: `Item[${i}].add_ons[${j}]: id is missing`,
            });
          }

          if (!addOn?.quantity?.selected?.count) {
            results.push({
              valid: false,
              code: 30000,
              description: `Item[${i}].add_ons[${j}]: quantity.selected.count is missing`,
            });
          }
        }
      }

      // Validate fulfillment_ids
      if (!item?.fulfillment_ids || !Array.isArray(item.fulfillment_ids) || item.fulfillment_ids.length === 0) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: fulfillment_ids is missing or empty`,
        });
      }

      // Validate xinput
      const xinput = item?.xinput;
      if (xinput) {
        // Validate form_response
        if (xinput?.form_response) {
          if (!xinput.form_response?.submission_id) {
            results.push({
              valid: false,
              code: 30000,
              description: `Item[${i}]: xinput.form_response.submission_id is missing`,
            });
          }
          if (!xinput.form_response?.status) {
            results.push({
              valid: false,
              code: 30000,
              description: `Item[${i}]: xinput.form_response.status is missing`,
            });
          }
        }

        // Validate form.id
        if (!xinput?.form?.id) {
          results.push({
            valid: false,
            code: 30000,
            description: `Item[${i}]: xinput.form.id is missing`,
          });
        }
      }

      // Validate tags
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

  // Validate quote
  if (!quote) {
    results.push({
      valid: false,
      code: 30000,
      description: "Quote is missing in on_status",
    });
  } else {
    // Validate quote.id
    if (!quote?.id) {
      results.push({
        valid: false,
        code: 30000,
        description: "quote.id is missing",
      });
    }

    // Validate quote.price
    if (!quote?.price?.value) {
      results.push({
        valid: false,
        code: 30000,
        description: "quote.price.value is missing",
      });
    }

    if (!quote?.price?.currency) {
      results.push({
        valid: false,
        code: 30000,
        description: "quote.price.currency is missing",
      });
    }

    // Validate quote.breakup
    const breakup = quote?.breakup;
    if (!Array.isArray(breakup) || breakup.length === 0) {
      results.push({
        valid: false,
        code: 30000,
        description: "quote.breakup is missing or empty",
      });
    } else {
      for (let i = 0; i < breakup.length; i++) {
        const breakupItem = breakup[i];

        if (!breakupItem?.title) {
          results.push({
            valid: false,
            code: 30000,
            description: `quote.breakup[${i}]: title is missing`,
          });
        }

        if (!breakupItem?.price?.value) {
          results.push({
            valid: false,
            code: 30000,
            description: `quote.breakup[${i}]: price.value is missing`,
          });
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
