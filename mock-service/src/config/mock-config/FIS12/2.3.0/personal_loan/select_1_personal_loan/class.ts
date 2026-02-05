import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { selectPersonalLoanGenerator } from "./generator";

export class MockSelect1PersonalLoanClass extends MockAction {
    get saveData(): saveType {
        return yaml.load(
            readFileSync(path.resolve(__dirname, "./save-data.yaml"), "utf8")
        ) as saveType;
    }
    get defaultData(): any {
        return yaml.load(
            readFileSync(path.resolve(__dirname, "./default.yaml"), "utf8")
        );
    }
    get inputs(): any {
        return {};
    }
    name(): string {
        return "select_1_personal_loan";
    }
    get description(): string {
        return "Mock for select_1 personal loan";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return selectPersonalLoanGenerator(existingPayload, sessionData);
    }
    async validate(targetPayload: any): Promise<MockOutput> {
        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        if (!sessionData.items || !Array.isArray(sessionData.items) || sessionData.items.length === 0) {
            return { valid: false, message: "No items available in session data from on_search" };
        }
        if (!sessionData.selected_provider) {
            return { valid: false, message: "No selected_provider available in session data" };
        }
        return { valid: true };
    }
}
