import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../../classes/mock-action";
import { SessionData } from "../../../session-types";
import { searchInvoiceLoanGenerator } from "./generator";

export class MockSearchInvoiceLoanClass extends MockAction {
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
        return {
            city_code: {
                name: "Enter city code",
                label: "Enter city code",
                type: "text",
                payloadField: "$.context.location.city.code"
            }
        };
    }
    name(): string {
        return "search_invoice_loan";
    }
    get description(): string {
        return "Mock for search personal loan";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return searchInvoiceLoanGenerator(existingPayload, sessionData);
    }

    async validate(targetPayload: any): Promise<MockOutput> {
        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        console.log("sessionData in search_invoice_loan class", sessionData.message_id);
        if (!sessionData.transaction_id) {
            return {
                valid: false,
                message: "No transaction_id available in session data"
            };
        }

        return { valid: true };
    }
}
