import axios from "axios";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { validateFormHtml } from "./validate-form";
import { resolveFormActions } from "./resolve-action";

export class MockRetryPaymentFormClass extends MockAction {
	name(): string {
		return "retry_payment_url_form";
	}
	get description(): string {
		return "Mock for retry_payment_url_form";
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
		const formLink = sessionData["retry_payment_url_form"];
		if (!formLink) {
			return { valid: false, message: "Form link not found in session data" };
		}
		const formRaw = await axios.get(formLink);
		const formData = formRaw.data;
		const r1 = validateFormHtml(formData);
		if (r1.ok === false) {
			return { valid: false, message: r1.errors.join("; ") };
		}
		return { valid: true };
	}

	override async __forceSaveData(
		sessionData: SessionData
	): Promise<Record<string, any>> {

		const formLink = sessionData["retry_payment_url_form"];
		if (!formLink) {
			throw new Error("Form link not found in session data");
		}
		const formRaw = await axios.get(formLink);
		const formData = formRaw.data;
		return {
			...sessionData,
			retry_payment_url_form: resolveFormActions(formLink, formData),
		};
	}

	meetRequirements(sessionData: SessionData): Promise<MockOutput> {
		return Promise.resolve({ valid: true });
	}
	get saveData(): saveType {
		return { "save-data": { retry_payment_url_form: "retry_payment_url_form" } };
	}
	get defaultData(): any {
		return {};
	}
	get inputs(): any {
		return {};
	}
}