import { SessionData } from "../../../session-types";

/**
 * Init 4 Generator for Invoice Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and action
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new UUID message_id for init (new API call)
 * 4. Update provider.id and item.id from session data (carry-forward from on_init_3)
 * 5. Update form_response with E-Sign verification status
 */
export async function initInvoiceLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("init_4_invoice_loan generator - Session data:", sessionData);

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
        console.log("Generated new UUID message_id for init_4:", existingPayload.context.message_id);
    }

    // Update provider.id if available from session data (carry-forward from on_init_3)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from on_init_3)
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    // Update form ID and form_response with E-Sign verification status
    const submission_id = (sessionData as any)?.form_data?.loan_aggrement_verification_status?.form_submission_id || (sessionData as any).loan_aggrement_verification_status;
    if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
        existingPayload.message.order.items[0].xinput.form.id = "loan_aggrement_verification_status";
        console.log("Updated form ID to loan_aggrement_verification_status");
    }
    if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
        existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
        if (submission_id) {
            existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
        } else {
            existingPayload.message.order.items[0].xinput.form_response.submission_id = `ESIGN_SUBMISSION_${Date.now()}`;
        }
        console.log("Updated form_response with E-Sign status and submission_id");
    }

    console.log("init_4_invoice_loan payload generated successfully");
    return existingPayload;
}
