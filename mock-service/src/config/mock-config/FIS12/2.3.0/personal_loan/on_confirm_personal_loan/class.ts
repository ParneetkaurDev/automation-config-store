import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { onConfirmPersonalLoanGenerator } from "./generator";

export class MockOnConfirmPersonalLoanClass extends MockAction {
    get saveData(): saveType { return yaml.load(readFileSync(path.resolve(__dirname, "./save-data.yaml"), "utf8")) as saveType; }
    get defaultData(): any { return yaml.load(readFileSync(path.resolve(__dirname, "./default.yaml"), "utf8")); }
    get inputs(): any { return {}; }
    name(): string { return "on_confirm_personal_loan"; }
    get description(): string { return "Mock for on_confirm_personal_loan"; }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> { return onConfirmPersonalLoanGenerator(existingPayload, sessionData); }
    async validate(targetPayload: any): Promise<MockOutput> { return { valid: true }; }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> { return { valid: true }; }
}
