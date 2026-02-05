import { SessionData } from "../../../session-types";

/**
 * Status Generator for Invoice Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and action
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new UUID message_id for status (new API call)
 * 4. Update order_id from session data (carry-forward from on_confirm)
 */
export async function statusInvoiceLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("status_invoice_loan generator - Session data:", sessionData);

    // Update context timestamp and action
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        existingPayload.context.action = "status";
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new UUID message_id for status (new API call)
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();
        console.log("Generated new UUID message_id for status:", existingPayload.context.message_id);
    }

    // Update order_id from session data (carry-forward from on_confirm)
    if ((sessionData as any).order_id && existingPayload.message?.order_id) {
        existingPayload.message.order_id = (sessionData as any).order_id;
        console.log("Updated order_id:", (sessionData as any).order_id);
    } else if ((sessionData as any).order_id && existingPayload.message) {
        existingPayload.message.order_id = (sessionData as any).order_id;
        console.log("Set order_id:", (sessionData as any).order_id);
    }

    console.log("status_invoice_loan payload generated successfully");
    return existingPayload;
}
