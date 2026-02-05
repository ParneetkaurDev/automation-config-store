import { SessionData } from "../../../session-types";

export async function onSearchPersonalLoan3Generator(existingPayload: any, sessionData: SessionData) {
    console.log("on_search_personal_loan_2 generator", sessionData.message_id);
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
    }
    return existingPayload;
}
