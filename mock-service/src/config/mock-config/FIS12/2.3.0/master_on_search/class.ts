import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { MockAction, MockOutput, saveType } from "../../classes/mock-action";
import { SessionData } from "../../session-types";
import { masterOnSearchDefaultGenerator } from "./generator";

export class MockMasterOnSearchClass extends MockAction {
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
        };
    }

    name(): string {
        return "master_on_search_unified_credit";
    }
    get description(): string {
        return "Mock for master_on_search_unified_credit";
    }
    generator(existingPayload: any, sessionData: SessionData): Promise<any> {
        return masterOnSearchDefaultGenerator(existingPayload, sessionData);
    }
    async validate(targetPayload: any): Promise<MockOutput> {

        return { valid: true };
    }
    async meetRequirements(sessionData: SessionData): Promise<MockOutput> {

        return { valid: true };
    }
}