import { readFileSync } from "fs";
import logger from "@ondc/automation-logger";
import path from "path";
import yaml from "js-yaml";
import { SessionData as MockSessionDataFIS13 } from "./FIS13/session-types";
import { createFIS13MockResponse } from "./FIS13/version-factory";
import { getFIS13MockAction, listFIS13MockActions } from "./FIS13/action-factory";

// Export with neutral names for external code
export type MockSessionData = MockSessionDataFIS13;
export { MockSessionDataFIS13 };

export const actionConfig = yaml.load(
  readFileSync(path.join(__dirname, "./FIS13/factory.yaml"), "utf8")
) as any;

// Neutral name that maps to FIS13
export const defaultSessionData = () =>
  yaml.load(
    readFileSync(path.join(__dirname, "./FIS13/session-data.yaml"), "utf8")
  ) as { session_data: MockSessionData };

export const defaultSessionDataFIS13 = defaultSessionData;

export async function generateMockResponse(
  session_id: string,
  sessionData: any,
  action_id: string,
  input?: any
) {
  try {
    const domain = process.env.DOMAIN;

    let response: any = "";
    if (domain === "ONDC:FIS13") {
      response = await createFIS13MockResponse(
        session_id,
        sessionData,
        action_id,
        input
      );
    } 
    response.context.timestamp = new Date().toISOString();
    return response;
  } catch (e) {
    logger.error("Error in generating mock response", e);
    throw e;
  }
}

// Neutral function that routes to appropriate config
export function getMockActionObject(actionId: string) {
  const domain = process.env.DOMAIN;
  // if (domain === "ONDC:FIS13") {
    return getFIS13MockAction(actionId);
  // }
}

// For backward compatibility with TRV14 imports
export function getMockAction(actionId: string) {
  return getMockActionObject(actionId);
}

export function getAllMockActionIds() {
  return listFIS13MockActions();
}

export function getActionData(code: number) {
  const domain = process.env.DOMAIN;
  let actionData:any = "";

  if (domain == "ONDC:FIS13") {
	actionData = actionConfig.codes.find((action: any) => action.code === code);

  } 
  if (actionData) {
    return actionData;
  }
  throw new Error(`Action code ${code} not found`);
}

export function getSaveDataContent(version: string, action: string) {
  const domain: any = process.env.DOMAIN;
  let actionFolderPath: any = "";
  if (domain === "ONDC:FIS13") {
    actionFolderPath = path.resolve(__dirname, `./FIS13/${version}/${action}`);
  } 
  const saveDataFilePath = path.join(actionFolderPath, "save-data.yaml");
  const fileContent = readFileSync(saveDataFilePath, "utf8");
  const cont = yaml.load(fileContent) as any;
  console.log(cont);
  return cont;
}
// 
export function getUiMetaKeys(): (keyof MockSessionData)[] {
  // Return UI-relevant session data keys for FIS13
  return [];
}
