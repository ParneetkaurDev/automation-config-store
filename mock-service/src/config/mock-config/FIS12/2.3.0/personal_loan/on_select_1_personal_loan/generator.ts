import { SessionData } from "../../../session-types";

/**
 * On Select 1 Generator for Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward from select)
 * 4. Generate dynamic form URL for xinput
 */
export async function onSelectPersonalLoanGenerator(existingPayload: any, sessionData: SessionData) {
    console.log("on_select_1_personal_loan generator - Session data:", {
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

    // Update provider.id if available from session data (carry-forward from select)
    if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
        existingPayload.message.order.provider.id = sessionData.selected_provider.id;
        console.log("Updated provider.id:", sessionData.selected_provider.id);
    }

    // Update item.id if available from session data (carry-forward from select)
    if (sessionData.items && Array.isArray(sessionData.items) && sessionData.items.length > 0) {
        const selectedItem = sessionData?.items?.[1] ? sessionData?.items?.[1] : sessionData?.items?.[0];
        if (existingPayload.message?.order?.items?.[0]) {
            existingPayload.message.order.items[0].id = selectedItem.id;
            console.log("Updated item.id:", selectedItem.id);
        }
    }

    // Generate dynamic form URL for xinput
    // if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    //     const url = `${process.env.FORM_SERVICE}/forms/${(sessionData as any).domain}/down_payment_form?session_id=${(sessionData as any).session_id}&flow_id=${(sessionData as any).flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    //     existingPayload.message.order.items[0].xinput.form.id = "down_payment_form";
    //     existingPayload.message.order.items[0].xinput.form.url = url;
    //     console.log("Updated xinput form URL:", url);
    // }

    console.log("on_select_1_personal_loan payload generated successfully");
    return existingPayload;
}
