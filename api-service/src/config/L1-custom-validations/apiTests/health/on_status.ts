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

// Required GENERAL_INFO fields for on_select
const REQUIRED_GENERAL_INFO_FIELDS_ON_SELECT = [
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

// Required GENERAL_INFO fields for on_init (includes ROOM_RENT_CAP)
const REQUIRED_GENERAL_INFO_FIELDS_ON_INIT = [
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

// Required GENERAL_INFO fields for on_status (no ROOM_RENT_CAP)
const REQUIRED_GENERAL_INFO_FIELDS_ON_STATUS = [
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

  // Validate item.fulfillment_ids
  // if (!item?.fulfillment_ids || !Array.isArray(item.fulfillment_ids) || item.fulfillment_ids.length === 0) {
  //   results.push({
  //     valid: false,
  //     code: 30000,
  //     description: `Item[${itemIndex}]: fulfillment_ids is missing or empty`,
  //   });
  // }
}

// Helper function to validate quote
function validateQuote(payload: any, results: validationOutput): void {
  const quote = payload?.message?.order?.quote;

  if (!quote) {
    results.push({
      valid: false,
      code: 30000,
      description: "Quote is missing",
    });
    return;
  }

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

      if (!breakupItem?.price?.currency) {
        results.push({
          valid: false,
          code: 30000,
          description: `quote.breakup[${i}]: price.currency is missing`,
        });
      }
    }
  }
}

export function onStatus(payload: any, previousAction: string | null = null): validationOutput {
  const context = payload?.context;
  const domain = context?.domain;
  const action = context?.action;

  console.log(`Running health insurance validations for ${domain}/${action}`);
  console.log(`Previous action was: ${previousAction}`);

  // If previous action was on_select, apply on_select validations + xinput
  if (previousAction === "on_select") {
    return validateAsOnSelect(payload);
  }

  // If previous action was on_init, apply on_init validations + xinput
  if (previousAction === "on_init") {
    return validateAsOnInit(payload);
  }

  // Default: apply normal on_status validations
  return validateAsOnStatus(payload);
}

// Validate payload as if it were on_select response + xinput validation
function validateAsOnSelect(payload: any): validationOutput {
  console.log("Applying on_select validations for on_status (previous action: on_select)");

  const results: validationOutput = [];

  // Validate context
  validateContext(payload, results);

  // Validate provider
  validateProvider(payload, results);

  const items = payload?.message?.order?.items;

  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty (validating as on_select)",
    });
    return results;
  }

  // Validate GENERAL_INFO tags for each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Validate basic item fields
    validateBasicItemFields(item, i, results);

    const tags = item?.tags;

    if (!Array.isArray(tags)) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${i}]: tags array is missing (validating as on_select)`,
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
        description: `Item[${i}]: GENERAL_INFO tag is missing (validating as on_select)`,
      });
      continue;
    }

    const list = generalInfoTag?.list;
    if (!Array.isArray(list)) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${i}]: GENERAL_INFO.list is missing or not an array (validating as on_select)`,
      });
      continue;
    }

    // Check for required fields
    const presentFields = list.map(
      (listItem: any) => listItem?.descriptor?.code
    );

    for (const requiredField of REQUIRED_GENERAL_INFO_FIELDS_ON_SELECT) {
      if (!presentFields.includes(requiredField)) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: GENERAL_INFO.list.${requiredField} is missing (validating as on_select)`,
        });
      }
    }

    // Validate xinput object
    validateXinput(item, i, results, "on_select");
  }

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}

// Validate payload as if it were on_init response + xinput validation
function validateAsOnInit(payload: any): validationOutput {
  console.log("Applying on_init validations for on_status (previous action: on_init)");

  const results: validationOutput = [];

  // Validate context
  validateContext(payload, results);

  const order = payload?.message?.order;
  const items = order?.items;
  const provider = order?.provider;

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    results.push({
      valid: false,
      code: 30000,
      description: "Items array is missing or empty (validating as on_init)",
    });
  } else {
    // Validate GENERAL_INFO tags for each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Validate basic item fields
      validateBasicItemFields(item, i, results);

      const tags = item?.tags;

      if (!Array.isArray(tags)) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: tags array is missing (validating as on_init)`,
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
          description: `Item[${i}]: GENERAL_INFO tag is missing (validating as on_init)`,
        });
        continue;
      }

      const list = generalInfoTag?.list;
      if (!Array.isArray(list)) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: GENERAL_INFO.list is missing or not an array (validating as on_init)`,
        });
        continue;
      }

      // Check for required fields
      const presentFields = list.map(
        (listItem: any) => listItem?.descriptor?.code
      );

      for (const requiredField of REQUIRED_GENERAL_INFO_FIELDS_ON_INIT) {
        if (!presentFields.includes(requiredField)) {
          results.push({
            valid: false,
            code: 30000,
            description: `Item[${i}]: GENERAL_INFO.list.${requiredField} is missing (validating as on_init)`,
          });
        }
      }

      // Validate xinput object
      validateXinput(item, i, results, "on_init");
    }
  }

  // Validate provider descriptor
  if (!provider) {
    results.push({
      valid: false,
      code: 30000,
      description: "Provider is missing (validating as on_init)",
    });
  } else {
    const descriptor = provider?.descriptor;

    if (!descriptor) {
      results.push({
        valid: false,
        code: 30000,
        description: "Provider descriptor is missing (validating as on_init)",
      });
    } else {
      // Validate required provider descriptor fields
      if (!descriptor?.name) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.name is missing (validating as on_init)",
        });
      }

      if (!descriptor?.short_desc) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.short_desc is missing (validating as on_init)",
        });
      }

      if (!descriptor?.long_desc) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.long_desc is missing (validating as on_init)",
        });
      }

      // Validate images
      const images = descriptor?.images;
      if (!Array.isArray(images) || images.length === 0) {
        results.push({
          valid: false,
          code: 30000,
          description: "Provider descriptor.images is missing or empty (validating as on_init)",
        });
      } else {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          if (!image?.url) {
            results.push({
              valid: false,
              code: 30000,
              description: `Provider descriptor.images[${i}].url is missing (validating as on_init)`,
            });
          }
          if (!image?.size_type) {
            results.push({
              valid: false,
              code: 30000,
              description: `Provider descriptor.images[${i}].size_type is missing (validating as on_init)`,
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

// Validate xinput object for an item
function validateXinput(item: any, itemIndex: number, results: validationOutput, context: string): void {
  const xinput = item?.xinput;

  if (!xinput) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: xinput is missing (validating as ${context})`,
    });
    return;
  }

  // Validate xinput.form
  if (!xinput?.form) {
    results.push({
      valid: false,
      code: 30000,
      description: `Item[${itemIndex}]: xinput.form is missing (validating as ${context})`,
    });
  } 
  else {
    if (!xinput.form?.id) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${itemIndex}]: xinput.form.id is missing (validating as ${context})`,
      });
    }
    // if (!xinput.form?.url) {
    //   results.push({
    //     valid: false,
    //     code: 30000,
    //     description: `Item[${itemIndex}]: xinput.form.url is missing (validating as ${context})`,
    //   });
    // }
    // if (!xinput.form?.mime_type) {
    //   results.push({
    //     valid: false,
    //     code: 30000,
    //     description: `Item[${itemIndex}]: xinput.form.mime_type is missing (validating as ${context})`,
    //   });
    // }
  }

  // Validate xinput.form_response if present
  if (xinput?.form_response) {
    if (!xinput.form_response?.status) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${itemIndex}]: xinput.form_response.status is missing (validating as ${context})`,
      });
    }
    if (!xinput.form_response?.submission_id) {
      results.push({
        valid: false,
        code: 30000,
        description: `Item[${itemIndex}]: xinput.form_response.submission_id is missing (validating as ${context})`,
      });
    }
  }

  // Validate xinput.head if present
  // if (xinput?.head) {
  //   if (!xinput.head?.descriptor?.name) {
  //     results.push({
  //       valid: false,
  //       code: 30000,
  //       description: `Item[${itemIndex}]: xinput.head.descriptor.name is missing (validating as ${context})`,
  //     });
  //   }
  //   if (xinput.head?.index) {
  //     if (xinput.head.index?.min === undefined) {
  //       results.push({
  //         valid: false,
  //         code: 30000,
  //         description: `Item[${itemIndex}]: xinput.head.index.min is missing (validating as ${context})`,
  //       });
  //     }
  //     if (xinput.head.index?.cur === undefined) {
  //       results.push({
  //         valid: false,
  //         code: 30000,
  //         description: `Item[${itemIndex}]: xinput.head.index.cur is missing (validating as ${context})`,
  //       });
  //     }
  //     if (xinput.head.index?.max === undefined) {
  //       results.push({
  //         valid: false,
  //         code: 30000,
  //         description: `Item[${itemIndex}]: xinput.head.index.max is missing (validating as ${context})`,
  //       });
  //     }
  //   }
  // }
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
  const provider = order?.provider;

  // Validate provider descriptor images size_type (additional check)
  if (provider?.descriptor?.images) {
    const images = provider.descriptor.images;
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image?.size_type) {
        results.push({
          valid: false,
          code: 30000,
          description: `Provider descriptor.images[${i}].size_type is missing`,
        });
      }
    }
  }

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

      // Validate category_ids
      if (!item?.category_ids || !Array.isArray(item.category_ids) || item.category_ids.length === 0) {
        results.push({
          valid: false,
          code: 30000,
          description: `Item[${i}]: category_ids is missing or empty`,
        });
      }

      // Validate GENERAL_INFO tags
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

      for (const requiredField of REQUIRED_GENERAL_INFO_FIELDS_ON_STATUS) {
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

  // Validate quote
  validateQuote(payload, results);

  // If no issues found, return success
  if (results.length === 0) {
    results.push({ valid: true, code: 200 });
  }

  return results;
}
