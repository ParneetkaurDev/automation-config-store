import { SessionData } from "../../../session-types";

/**
 * Init 1 Generator for Invoice Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and action
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new UUID message_id for init (new API call)
 * 4. Update provider.id and item.id from session data (carry-forward from on_select)
 */
export async function initInvoiceLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("init_1_invoice_loan generator - Session data:", {
        selected_provider: !!sessionData.selected_provider,
        selected_items: !!sessionData.selected_items,
        items: !!sessionData.items,
        transaction_id: sessionData.transaction_id,
        message_id: sessionData.message_id
    });

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
        console.log("Generated new UUID message_id for init_1:", existingPayload.context.message_id);
    }

    // Update provider.id if available from session data (carry-forward from on_select)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from on_select)
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    console.log("init_1_invoice_loan payload generated successfully");
    return existingPayload;
}
