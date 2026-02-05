import { SessionData } from "../../../session-types";

/**
 * Init 3 Generator for Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and action
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new UUID message_id for init (new API call)
 * 4. Update provider.id and item.id from session data (carry-forward from on_init_2)
 * 5. Update form_response with Emanadate verification status
 */
export async function initPersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("init_3_personal_loan generator - Session data:", sessionData);

    // Update context timestamp and action
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        existingPayload.context.action = "init";
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new UUID message_id for init (new API call)
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();
        console.log("Generated new UUID message_id for init_3:", existingPayload.context.message_id);
    }

    // Update provider.id if available from session data (carry-forward from on_init_2)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from on_init_2)
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    // Update form ID and form_response with Emanadate verification status
    const submission_id = (sessionData as any)?.form_data?.Emanadate_verification_status?.form_submission_id || (sessionData as any).Emanadate_verification_status;
    if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
        existingPayload.message.order.items[0].xinput.form.id = "Emanadate_verification_status";
        console.log("Updated form ID to Emanadate_verification_status");
    }
    if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
        existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
        if (submission_id) {
            existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
        } else {
            existingPayload.message.order.items[0].xinput.form_response.submission_id = `EMANADATE_SUBMISSION_${Date.now()}`;
        }
        console.log("Updated form_response with Emanadate status and submission_id");
    }

    console.log("init_3_personal_loan payload generated successfully");
    return existingPayload;
}
