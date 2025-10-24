import { readFileSync } from "fs";
import logger from "@ondc/automation-logger";
import path from "path";
import yaml from "js-yaml";
import { SessionData as MockSessionData } from "./FIS10/session-types";
import { createMockResponse as createFIS10MockResponse } from "./FIS10/version-factory";
import { getMockAction as getFIS10MockAction } from "./FIS10/action-factory";

export { MockSessionData };

// Default to FIS10 for testing
const defaultDomain = process.env.DOMAIN || "ONDC:FIS10";

export const actionConfig = yaml.load(
	readFileSync(path.join(__dirname, "./FIS10/factory.yaml"), "utf8")
) as any;

export const defaultSessionData = (domain: string = defaultDomain) => {
	let sessionDataPath: string;
	console.log("domain>>>>>>>>>>>", domain);
	switch (domain) {
		case "ONDC:FIS14":
			sessionDataPath = path.join(__dirname, `./FIS14/session-data.yaml`);
			break;
		case "ONDC:FIS10":
			sessionDataPath = path.join(__dirname, `./FIS10/session-data.yaml`);
			break;
		case "ONDC:FIS12":
			sessionDataPath = path.join(__dirname, `./FIS12/session-data.yaml`);
			break;
		case "ONDC:TRV14":
			sessionDataPath = path.join(__dirname, `./TRV14/session-data.yaml`);
			break;
		default:
			sessionDataPath = path.join(__dirname, `./${domain}/session-data.yaml`);
			break;
	}
	
	return yaml.load(readFileSync(sessionDataPath, "utf8")) as { session_data: MockSessionData };
};

export async function generateMockResponse(
	session_id: string,
	sessionData: any,
	action_id: string,
	input?: any,
	domain: string = defaultDomain
) {
	try {
		console.log("generateMockResponse - action_id:", action_id);
		console.log("generateMockResponse - domain:", domain);
		console.log("generateMockResponse - defaultDomain:", defaultDomain);
		console.log("generateMockResponse - sessionData", sessionData);
		
		let response = await createFIS10MockResponse(
			session_id,
			sessionData,
			action_id,
			input
		);
		response.context.timestamp = new Date().toISOString();
		return response;
	} catch (e) {
		logger.error("Error in generating mock response", e);
		throw e;
	}
}

export function getMockActionObject(actionId: string, sessionId?: string) {
		return getFIS10MockAction(actionId);
		}

export function getActionData(code: number, domain: string = defaultDomain) {
	if (!actionConfig) {
		throw new Error(`Domain ${domain} not supported`);
	}
	
	const actionData = actionConfig.codes.find(
		(action: any) => action.code === code
	);
	if (actionData) {
		return actionData;
	}
	throw new Error(`Action code ${code} not found for domain ${domain}`);
}

export function getSaveDataContent(version: string, action: string, domain: string = defaultDomain) {
	let actionFolderPath: string;
	
	switch (domain) {
		case "ONDC:FIS14":
		case "ONDC:TRV14":
		case "ONDC:FIS10":
		case "ONDC:FIS12":
			actionFolderPath = path.resolve(
				__dirname,
				`./${domain}/${version}/${action}`
			);
			break;
		default:
			actionFolderPath = path.resolve(
				__dirname,
				`./${domain}/${version}/${action}`
			);
			break;
	}
	
	const saveDataFilePath = path.join(actionFolderPath, "save-data.yaml");
	const fileContent = readFileSync(saveDataFilePath, "utf8");
	const cont = yaml.load(fileContent) as any;
	console.log(cont);
	return cont;
}

export function getUiMetaKeys(): (keyof MockSessionData)[] {
	return [];
}
