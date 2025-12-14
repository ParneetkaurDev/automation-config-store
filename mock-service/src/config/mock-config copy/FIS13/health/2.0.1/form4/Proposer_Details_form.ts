import axios from "axios";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { validateFormHtml } from "./validate-form";
import { resolveFormActions } from "./resolve-action";

export class MockProposerDetailsFormClass extends MockAction {
	name(): string {
		return "Proposer_Details_form";
	}
	get description(): string {
		return "Mock for Proposer_Details_form";
	}
	generator(existingPayload: any, sessionData: SessionData): Promise<any> {
		throw new Error("Method not implemented.");
	}
	async validate(
		targetPayload: any,
		sessionData?: SessionData
	): Promise<MockOutput> {
		if (!sessionData) {
			return {
				valid: false,
				message: "Session data is required for validation",
			};
		}
		const formLink = sessionData["Proposer_Details_form"];
		if (!formLink) {
			return { valid: false, message: "Form link not found in session data" };
		}
		const formRaw = await axios.get(formLink);
		const formData = formRaw.data;
		const r1 = validateFormHtml(formData);
		if ((await r1).ok === false) {
			return { valid: false, message: (await r1).errors.join("; ") };
		}
		return { valid: true };
	}

	override async __forceSaveData(
		sessionData: SessionData
	): Promise<Record<string, any>> {
		
		const formLink = sessionData["Proposer_Details_form"];
		console.log('formLink>>>', formLink)
		if (!formLink) {
			throw new Error("Form link not found in session data");
		}
		const formRaw = await axios.get(formLink);
		const formData = formRaw.data;
		return {
			...sessionData,
			Proposer_Details_form: resolveFormActions(formLink, formData),
		};
	}

	meetRequirements(sessionData: SessionData): Promise<MockOutput> {
		return Promise.resolve({ valid: true });
	}
	get saveData(): saveType {
		return { "save-data": { Proposer_Details_form: "Proposer_Details_form" } };
	}
	get defaultData(): any {
		return {};
	}
	get inputs(): any {
		return {};
	}
}