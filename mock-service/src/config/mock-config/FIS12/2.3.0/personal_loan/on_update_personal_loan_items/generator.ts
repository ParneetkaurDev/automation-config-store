import { SessionData } from "../../../session-types";

/**
 * On Update Generator for Personal Loan Items
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update order_id from session data (carry-forward from on_confirm)
 * 4. Generate payment URL based on update label (FORECLOSURE, MISSED_EMI_PAYMENT, PRE_PART_PAYMENT)
 */
export async function onUpdatePersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_update_personal_loan_items generator - Session data:", sessionData);

    // Update context timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Use the same message_id as update (matching pair)
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
        console.log("Using matching message_id from update:", sessionData.message_id);
    }

    // Ensure order structure exists
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

    // Set payment URL based on update label
    const updateLabel = (sessionData as any).update_label || 'FORECLOSURE';
    if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
        const payment = order.payments[0];
        payment.time = payment.time || {};
        payment.time.label = updateLabel;

        // Generate payment URL with reference ID
        const refId = sessionData.message_id || order.id || crypto.randomUUID();
        const amount = payment.params?.amount || '0';
        payment.url = `https://pg.icici.com/?amount=${amount}&ref_id=${encodeURIComponent(refId)}`;
        console.log("Generated payment URL:", payment.url);
    }

    console.log("on_update_personal_loan_items payload generated successfully");
    return existingPayload;
}
