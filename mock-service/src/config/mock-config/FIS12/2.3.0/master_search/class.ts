import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../classes/mock-action";
import { SessionData } from "../../session-types";
import { masterSearchDefaultGenerator } from "./generator";

export class MockMasterSearchClass extends MockAction {
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
        return "master_search_unified_credit";
    }
    get description(): string {
        return "Mock for master_search_unified_credit";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return masterSearchDefaultGenerator(existingPayload, sessionData);
    }
    
    async validate(targetPayload: any): Promise<MockOutput> {
        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {
        console.log("sessionData in  search class", sessionData.message_id);
        // Validate required session data for search generator
        if (!sessionData.transaction_id) {
            return { 
                valid: false, 
                message: "No transaction_id available in session data" 
            };
        }
        
        return { valid: true };
    }
}
