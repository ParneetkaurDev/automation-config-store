import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";

export async function on_init_redemptionDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_init_redemption Generator Start ===");

    // Update context IDs
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        if (sessionData.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
        if (sessionData.message_id) existingPayload.context.message_id = sessionData.message_id;
    }

    // Update provider from session
    const selectedProvider = sessionData.selected_provider || sessionData.provider_id;
    if (selectedProvider && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id =
            typeof selectedProvider === 'string' ? selectedProvider : selectedProvider.id;
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

    // Update fulfillment from session
    // if (sessionData.fulfillment && existingPayload.message?.order?.fulfillments?.[0]) {
    //     existingPayload.message.order.fulfillments[0].id =
    //         typeof sessionData.fulfillment === 'string'
    //             ? sessionData.fulfillment
    //             : sessionData.fulfillment.id;
    // }

    // Inject payments (BPP settlement terms) from session
    if (sessionData.payments && existingPayload.message?.order?.payments) {
        existingPayload.message.order.payments = sessionData.payments;
    }

    // Inject quote from session
    if (sessionData.quote && existingPayload.message?.order?.quote) {
        existingPayload.message.order.quote = {
            ...existingPayload.message.order.quote,
            ...sessionData.quote,
        };
    }

    // Override hardcoded timestamps from default.yaml with dynamic values
    const now = new Date().toISOString();
    if (existingPayload.message?.order) {
        existingPayload.message.order.created_at = now;
        existingPayload.message.order.updated_at = now;
    }

    console.log("=== on_init_redemption Generator End ===");
    return existingPayload;
}
