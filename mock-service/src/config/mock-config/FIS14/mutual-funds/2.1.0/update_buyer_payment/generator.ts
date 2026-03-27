import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";

export async function updateDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== init Generator Start ===");

    // Update context
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        existingPayload.context.action = "update";
    }

    // Update transaction_id from session
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new message_id for init
    if (existingPayload.context) {
        existingPayload.context.message_id = randomUUID();
    }

    console.log("=== init Generator End ===");
    return existingPayload;
}
