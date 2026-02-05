import { SessionData } from "../../../session-types";

/**
 * Update Generator for Personal Loan Items
 * 
 * Logic:
 * 1. Update context with current timestamp and action
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new UUID message_id for update (new API call)
 * 4. Update order_id from session data (carry-forward from on_confirm)
 * 5. Set update label (FORECLOSURE, MISSED_EMI_PAYMENT, PRE_PART_PAYMENT)
 */
export async function updatePersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("update_personal_loan_items generator - Session data:", sessionData);

    // Update context timestamp and action
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        existingPayload.context.action = "update";
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new UUID message_id for update (new API call)
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();
        console.log("Generated new UUID message_id for update:", existingPayload.context.message_id);
    }

    // Ensure order structure exists
    if (!existingPayload.message) {
        existingPayload.message = {};
    }
    if (!existingPayload.message.update_target) {
        existingPayload.message.update_target = "items";
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

    // Determine update label based on user inputs or session data
    const updateLabel = (sessionData as any).update_label ||
        ((sessionData as any).user_inputs?.foreclosure_amount ? 'FORECLOSURE' :
            (sessionData as any).user_inputs?.missed_emi_amount ? 'MISSED_EMI_PAYMENT' :
                (sessionData as any).user_inputs?.part_payment_amount ? 'PRE_PART_PAYMENT' : 'FORECLOSURE');

    // Set payment time label for update type
    if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
        order.payments[0].time = order.payments[0].time || {};
        order.payments[0].time.label = updateLabel;
        console.log("Set payment time label:", updateLabel);
    }

    console.log("update_personal_loan_items payload generated successfully");
    return existingPayload;
}
