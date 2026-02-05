import { SessionData } from "../../../session-types";

/**
 * On Status Unsolicited Generator for Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new message_id for unsolicited callback (BPP-initiated)
 * 4. Update order_id and set order state to IN_PROGRESS or COMPLETED
 * 5. Update fulfillment state to DISBURSED if payment completed
 */
export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_status_unsolicited_personal_loan generator - Session data:", sessionData);

    // Update context timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new UUID message_id for unsolicited status (BPP-initiated)
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();
        console.log("Generated new UUID message_id for unsolicited status:", existingPayload.context.message_id);
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

    // Update fulfillment state if available
    if (order.fulfillments && Array.isArray(order.fulfillments) && order.fulfillments.length > 0) {
        order.fulfillments[0].state = order.fulfillments[0].state || {};
        order.fulfillments[0].state.descriptor = order.fulfillments[0].state.descriptor || {};
        order.fulfillments[0].state.descriptor.code = "DISBURSED";
        console.log("Set fulfillment state to DISBURSED");
    }

    console.log("on_status_unsolicited_personal_loan payload generated successfully - Unsolicited status callback");
    return existingPayload;
}
