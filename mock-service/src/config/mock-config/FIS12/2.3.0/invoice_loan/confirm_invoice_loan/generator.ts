import { SessionData } from "../../../session-types";

/**
 * Confirm Generator for Invoice Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and action
 * 2. Update transaction_id from session data (carry-forward mapping)
 * 3. Generate new UUID message_id for confirm (new API call)
 * 4. Update provider.id, items, payments, quote from session data (carry-forward from on_init_4)
 */
export async function confirmInvoiceLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("confirm_invoice_loan generator - Session data:", sessionData);

    // Update context timestamp and action
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        existingPayload.context.action = "confirm";
    }

    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new UUID message_id for confirm (new API call)
    if (existingPayload.context) {
        existingPayload.context.message_id = crypto.randomUUID();
        console.log("Generated new UUID message_id for confirm:", existingPayload.context.message_id);
    }

    // Update provider.id if available from session data (carry-forward from on_init_4)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from on_init_4)
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    // Update payments from session data (carry-forward from on_init_1)
    if ((sessionData as any).payments && existingPayload.message?.order) {
        // Merge payment IDs if needed
        if (Array.isArray((sessionData as any).payments) && Array.isArray(existingPayload.message.order.payments)) {
            existingPayload.message.order.payments = existingPayload.message.order.payments.map((payment: any, index: number) => {
                const sessionPayment = (sessionData as any).payments[index];
                if (sessionPayment?.id) {
                    payment.id = sessionPayment.id;
                }
                return payment;
            });
        }
        console.log("Updated payments from session data");
    }

    console.log("confirm_invoice_loan payload generated successfully");
    return existingPayload;
}
