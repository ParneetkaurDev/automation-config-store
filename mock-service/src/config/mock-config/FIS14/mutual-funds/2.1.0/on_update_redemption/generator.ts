import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";

export async function on_update_redemptionDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_update_redemption Generator Start ===");

    // Update context
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        if (sessionData.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
        existingPayload.context.message_id = randomUUID();
    }

    // Restore order ID from session
    if (sessionData.order_id && existingPayload.message?.order) {
        existingPayload.message.order.id = sessionData.order_id;
    }

    // Determine final status from user input (Status input: CANCELLED or COMPLETED)
    const finalStatus: string = sessionData?.user_inputs?.redemption_status || "COMPLETED";
    console.log("Redemption final status:", finalStatus);

    // Set order status
    if (existingPayload.message?.order) {
        existingPayload.message.order.status = finalStatus;
    }

    // Update payment status from session
    if (sessionData.payments && existingPayload.message?.order?.payments) {
        existingPayload.message.order.payments = sessionData.payments;
    }
    if (existingPayload.message?.order?.payments?.[0]) {
        existingPayload.message.order.payments[0].status =
            finalStatus === "CANCELLED" ? "NOT-PAID" : "PAID";
    }

    // Update item from session
    const selectedItem = sessionData.item || sessionData.selected_items?.[0];
    if (selectedItem && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id =
            typeof selectedItem === 'string' ? selectedItem : selectedItem.id;
    }

    // Inject quantity.selected.measure from session (saved at select_redemption step)
    const measure = (sessionData as any).redemption_measure;
    if (measure && existingPayload.message?.order?.items?.[0]) {
        if (!existingPayload.message.order.items[0].quantity) {
            existingPayload.message.order.items[0].quantity = {};
        }
        existingPayload.message.order.items[0].quantity.selected = { measure };
    }

    // Inject fulfillment (with agent/customer creds) from session
    const redemptionFulfillment = (sessionData as any).redemption_fulfillment;
    if (redemptionFulfillment && existingPayload.message?.order?.fulfillments?.[0]) {
        existingPayload.message.order.fulfillments[0] = {
            ...existingPayload.message.order.fulfillments[0],
            ...redemptionFulfillment,
        };
    }

    // Update updated_at timestamp
    if (existingPayload.message?.order) {
        existingPayload.message.order.created_at = sessionData.order.created_at;
        existingPayload.message.order.updated_at = new Date().toISOString();
    }

    console.log("=== on_update_redemption Generator End ===");
    return existingPayload;
}
