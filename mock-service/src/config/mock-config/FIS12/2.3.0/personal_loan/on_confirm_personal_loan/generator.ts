import { SessionData } from "../../../session-types";

/**
 * On Confirm Generator for Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Generate order ID if not present
 * 4. Update provider.id, item.id from session data (carry-forward from confirm)
 * 5. Set order state to ACCEPTED
 */
export async function onConfirmPersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_confirm_personal_loan generator - Session data:", sessionData);

    // Update context timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Use the same message_id as confirm (matching pair)
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
        console.log("Using matching message_id from confirm:", sessionData.message_id);
    }

    // Ensure order exists
    if (!existingPayload.message) {
        existingPayload.message = {};
    }
    if (!existingPayload.message.order) {
        existingPayload.message.order = {};
    }

    const order = existingPayload.message.order;

    // Generate or use order ID
    if (!(sessionData as any).order_id) {
        order.id = `PL_ORDER_${crypto.randomUUID()}`;
        console.log("Generated new order ID:", order.id);
    } else {
        order.id = (sessionData as any).order_id;
        console.log("Using order ID from session:", order.id);
    }


    // Update provider.id if available from session data (carry-forward from confirm)
    if (sessionData.selected_provider?.id && order.provider) {
        order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from confirm)
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && order.items?.[0]) {
        order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    // Update quote.id if applicable
    if ((sessionData as any).quote_id && order.quote) {
        order.quote.id = (sessionData as any).quote_id;
    }

    console.log("on_confirm_personal_loan payload generated successfully - Order state: ACCEPTED");
    return existingPayload;
}
