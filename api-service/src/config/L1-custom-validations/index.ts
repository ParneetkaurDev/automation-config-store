import { RedisService } from "ondc-automation-cache-lib";
import { validationOutput } from "./types";
import * as healthValidations from "./apiTests/health";
import * as motorValidations from "./apiTests/motor";

// Insurance type constants
const INSURANCE_TYPES = {
  HEALTH: "HEALTH_INSURANCE",
  MOTOR: "MOTOR_INSURANCE",
} as const;

type InsuranceType = (typeof INSURANCE_TYPES)[keyof typeof INSURANCE_TYPES] | null;

// Helper function to detect insurance type from search payload
function detectInsuranceTypeFromSearch(payload: any): InsuranceType {
  // Check intent.category.descriptor.code
  const intentCategory = payload?.message?.intent?.category?.descriptor?.code;
  if (intentCategory === INSURANCE_TYPES.HEALTH) {
    return INSURANCE_TYPES.HEALTH;
  }
  if (intentCategory === INSURANCE_TYPES.MOTOR) {
    return INSURANCE_TYPES.MOTOR;
  }
  return null;
}

// Helper function to detect insurance type from on_search payload
function detectInsuranceTypeFromOnSearch(payload: any): InsuranceType {
  const providers = payload?.message?.catalog?.["bpp/providers"] || [];

  for (const provider of providers) {
    // Check provider categories
    const categories = provider?.categories || [];
    for (const category of categories) {
      const code = category?.descriptor?.code;
      if (code === INSURANCE_TYPES.HEALTH) {
        return INSURANCE_TYPES.HEALTH;
      }
      if (code === INSURANCE_TYPES.MOTOR) {
        return INSURANCE_TYPES.MOTOR;
      }
    }

    // Check items category_ids
    const items = provider?.items || [];
    for (const item of items) {
      const categoryIds = item?.category_ids || [];
      if (categoryIds.includes(INSURANCE_TYPES.HEALTH)) {
        return INSURANCE_TYPES.HEALTH;
      }
      if (categoryIds.includes(INSURANCE_TYPES.MOTOR)) {
        return INSURANCE_TYPES.MOTOR;
      }
    }
  }

  return null;
}

// Helper function to detect insurance type from order payload (select, init, confirm, etc.)
function detectInsuranceTypeFromOrder(payload: any): InsuranceType {
  const items = payload?.message?.order?.items || [];

  for (const item of items) {
    const categoryIds = item?.category_ids || [];
    if (categoryIds.includes(INSURANCE_TYPES.HEALTH)) {
      return INSURANCE_TYPES.HEALTH;
    }
    if (categoryIds.includes(INSURANCE_TYPES.MOTOR)) {
      return INSURANCE_TYPES.MOTOR;
    }

    // Check category_id (older format)
    if (item?.category_id === INSURANCE_TYPES.HEALTH) {
      return INSURANCE_TYPES.HEALTH;
    }
    if (item?.category_id === INSURANCE_TYPES.MOTOR) {
      return INSURANCE_TYPES.MOTOR;
    }
  }

  return null;
}

// Store insurance type in Redis
async function storeInsuranceType(
  transactionId: string,
  insuranceType: InsuranceType
): Promise<void> {
  if (insuranceType) {
    await RedisService.setKey(
      `${transactionId}:insuranceType`,
      insuranceType
    );
    console.log(`Stored insurance type: ${insuranceType} for transaction: ${transactionId}`);
  }
}

// Get insurance type from Redis
async function getInsuranceTypeFromRedis(
  transactionId: string
): Promise<InsuranceType> {
  try {
    const insuranceType = await RedisService.getKey(
      `${transactionId}:insuranceType`
    );
    return insuranceType as InsuranceType;
  } catch (error) {
    console.error("Error getting insurance type from Redis:", error);
    return null;
  }
}

// Store previous action in Redis
async function storePreviousAction(
  transactionId: string,
  action: string
): Promise<void> {
  try {
    await RedisService.setKey(
      `${transactionId}:previousAction`,
      action
    );
    console.log(`Stored previous action: ${action} for transaction: ${transactionId}`);
  } catch (error) {
    console.error("Error storing previous action in Redis:", error);
  }
}

// Get previous action from Redis
async function getPreviousAction(
  transactionId: string
): Promise<string | null> {
  try {
    const previousAction = await RedisService.getKey(
      `${transactionId}:previousAction`
    );
    return previousAction as string | null;
  } catch (error) {
    console.error("Error getting previous action from Redis:", error);
    return null;
  }
}

// Detect and store insurance type based on action
async function getInsuranceType(
  payload: any,
  action: string
): Promise<InsuranceType> {
  const transactionId = payload?.context?.transaction_id;

  if (!transactionId) {
    return null;
  }

  let insuranceType: InsuranceType = null;

  // For initial actions, detect from payload and store
  if (action === "search") {
    insuranceType = detectInsuranceTypeFromSearch(payload);
    if (insuranceType) {
      await storeInsuranceType(transactionId, insuranceType);
    }
    return insuranceType;
  }

  if (action === "on_search") {
    insuranceType = detectInsuranceTypeFromOnSearch(payload);
    if (insuranceType) {
      await storeInsuranceType(transactionId, insuranceType);
    }
    return insuranceType;
  }

  // For order-based actions, try to detect from payload first
  insuranceType = detectInsuranceTypeFromOrder(payload);
  if (insuranceType) {
    // Update Redis with detected type
    await storeInsuranceType(transactionId, insuranceType);
    return insuranceType;
  }

  // If not found in payload, get from Redis (stored from earlier call)
  insuranceType = await getInsuranceTypeFromRedis(transactionId);
  return insuranceType;
}

export async function performL1CustomValidations(
  payload: any,
  action: string,
  subscriberUrl: string,
  allErrors = false,
  externalData = {}
): Promise<validationOutput> {
  console.log("Performing custom L1 validations for action: " + action);

  const domain = payload?.context?.domain;
  const transactionId = payload?.context?.transaction_id;

  // Only process FIS13 domain
  if (domain !== "ONDC:FIS13") {
    return [
      {
        valid: true,
        code: 200,
        description: "Custom validation passed",
      },
    ];
  }

  // Get insurance type
  const insuranceType = await getInsuranceType(payload, action);

  // Get previous action for on_status validation
  let previousAction: string | null = null;
  if (transactionId) {
    previousAction = await getPreviousAction(transactionId);
    // Store current action as previous action for next call
    await storePreviousAction(transactionId, action);
  }

  if (insuranceType === INSURANCE_TYPES.HEALTH) {
    return performHealthInsuranceValidations(payload, action, previousAction);
  }

  if (insuranceType === INSURANCE_TYPES.MOTOR) {
    return performMotorInsuranceValidations(payload, action, previousAction);
  }

  // Default: no custom validations
  return [
    {
      valid: true,
      code: 200,
      description: "Custom validation passed",
    },
  ];
}

function performHealthInsuranceValidations(
  payload: any,
  action: string,
  previousAction: string | null
): validationOutput {
  console.log("Performing health insurance validations for action: " + action);
  console.log("Previous action: " + previousAction);

  switch (action) {
    case "on_select":
      return healthValidations.onSelect(payload);
    case "on_init":
      return healthValidations.onInit(payload);
    case "confirm":
      return healthValidations.confirm(payload);
    case "on_confirm":
      return healthValidations.onConfirm(payload);
    case "on_status":
      return healthValidations.onStatus(payload, previousAction);
    case "on_update":
      return healthValidations.onUpdate(payload);
    case "on_cancel":
      return healthValidations.onCancel(payload);
    default:
      return [
        {
          valid: true,
          code: 200,
          description: "No custom validation for this action",
        },
      ];
  }
}

function performMotorInsuranceValidations(
  payload: any,
  action: string,
  previousAction: string | null
): validationOutput {
  console.log("Performing motor insurance validations for action: " + action);
  console.log("Previous action: " + previousAction);

  switch (action) {
    case "on_search":
      return motorValidations.onSearch(payload);
    case "select":
      return motorValidations.select(payload);
    case "on_select":
      return motorValidations.onSelect(payload);
    case "on_init":
      return motorValidations.onInit(payload);
    case "on_confirm":
      return motorValidations.onConfirm(payload);
    case "on_status":
      return motorValidations.onStatus(payload, previousAction);
    case "on_update":
      return motorValidations.onUpdate(payload);
    case "on_cancel":
      return motorValidations.onCancel(payload);
    default:
      return [
        {
          valid: true,
          code: 200,
          description: "No custom validation for this action",
        },
      ];
  }
}
