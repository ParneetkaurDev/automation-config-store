import { SessionData } from "../../../session-types";

/**
 * On Select 2 Generator for Invoice Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward from select_2)
 * 4. Generate dynamic form URL for eKYC verification
 */
export async function onSelectInvoiceLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_select_2_invoice_loan generator - Session data:", {
        transaction_id: sessionData.transaction_id,
        message_id: sessionData.message_id,
        quote: !!(sessionData as any).quote,
        items: !!sessionData.items
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
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
    }

    // Update provider.id if available from session data (carry-forward from select_2)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from select_2)
    const selectedItem = (sessionData as any).item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);
    if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
    }

    // Generate dynamic form URL for eKYC verification
    // if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    //     const url = `${process.env.FORM_SERVICE}/forms/${(sessionData as any).domain}/Ekyc_details_verification_status?session_id=${(sessionData as any).session_id}&flow_id=${(sessionData as any).flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    //     existingPayload.message.order.items[0].xinput.form.id = "Ekyc_details_verification_status";
    //     existingPayload.message.order.items[0].xinput.form.url = url;
    //     console.log("Updated xinput form to eKYC form:", url);
    // }

    console.log("on_select_2_invoice_loan payload generated successfully");
    return existingPayload;
}
