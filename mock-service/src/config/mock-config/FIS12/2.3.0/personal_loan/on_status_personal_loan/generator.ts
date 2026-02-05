import { SessionData } from "../../../session-types";

/**
 * On Status Generator for Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update order_id from session data (carry-forward from on_confirm)
 * 4. Set order state to ACTIVE and update provider/item from session data
 */
export async function onStatusPersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_status_personal_loan generator - Session data:", sessionData);

    // Update context timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Use the same message_id as status (matching pair)
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
        console.log("Using matching message_id from status:", sessionData.message_id);
    }

    // Ensure order exists
    if (!existingPayload.message) {
        existingPayload.message = {};
    }
    if (!existingPayload.message.order) {
        existingPayload.message.order = {};
    }

    const order = existingPayload.message.order;

    // Update order_id from session data (carry-forward from on_confirm)
    if ((sessionData as any).order_id) {
        order.id = (sessionData as any).order_id;
        console.log("Updated order.id:", (sessionData as any).order_id);
    }

    // Set order state to ACTIVE (loan is now active/in progress)
    order.state = "ACTIVE";

    // Update provider.id if available from session data
    if (sessionData.selected_provider?.id && order.provider) {
        order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && order.items?.[0]) {
        order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    console.log("on_status_personal_loan payload generated successfully - Order state: ACTIVE");
    return existingPayload;
}
