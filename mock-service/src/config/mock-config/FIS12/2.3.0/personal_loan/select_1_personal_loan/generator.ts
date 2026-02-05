import { SessionData } from "../../../session-types";

/**
 * Select 1 Generator for Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward from on_search)
 */
export async function selectPersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("select_1_personal_loan generator - Session data:", {
        selected_provider: !!sessionData.selected_provider,
        selected_items: !!sessionData.selected_items,
        items: !!sessionData.items,
        transaction_id: sessionData.transaction_id,
        message_id: sessionData.message_id
    });

    // Update context timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Update message_id from session data
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();;
    }

    // Update provider.id if available from session data (carry-forward from on_search)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from on_search)
    if (sessionData.items && Array.isArray(sessionData.items) && sessionData.items.length > 0) {
        const selectedItem = sessionData?.items?.[1] ? sessionData?.items?.[1] : sessionData?.items?.[0];
        if (existingPayload.message?.order?.items?.[0]) {
            existingPayload.message.order.items[0].id = selectedItem.id;
            console.log("Updated item.id:", selectedItem.id);
        }
    }

    console.log("select_1_personal_loan payload generated successfully");
    return existingPayload;
}
