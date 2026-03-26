import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";

export async function on_select_2DefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_select_2 Generator Start ===");

    // Update timestamp and IDs
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }


    // Update transaction_id and message_id from session
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
    }

    // Update provider and item from session
    const selectedProvider = sessionData.selected_provider || sessionData.provider_id;
    if (selectedProvider && existingPayload.message?.order?.provider) {
        if (typeof selectedProvider === 'string') {
            existingPayload.message.order.provider.id = selectedProvider;
        } else if (selectedProvider.id) {
            existingPayload.message.order.provider.id = selectedProvider.id;
        }
    }

    const selectedItem = sessionData.selected_item_id || sessionData.item;
    if (selectedItem && existingPayload.message?.order?.items?.[0]) {
        if (typeof selectedItem === 'string') {
            existingPayload.message.order.items[0].id = selectedItem;
        } else if (selectedItem.id) {
            existingPayload.message.order.items[0].id = selectedItem.id;
        }
    }

    // Generate quote ID
    if (existingPayload.message?.order?.quote) {
        if (!existingPayload.message.order.quote.id || existingPayload.message.order.quote.id.startsWith("QUOTE")) {
            existingPayload.message.order.quote.id = `quote_${randomUUID()}`;
            console.log("Generated quote.id:", existingPayload.message.order.quote.id);
        }
    }

    // Update submission_id from investor_details_form
    // const submission_id = sessionData?.form_data?.investor_details_form?.form_submission_id;
    // if (submission_id && existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    //     existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
    // }

    // if (existingPayload.message?.order?.items?.[0]?.xinput) {
    //     existingPayload.message.order.items[0].xinput.head.descriptor.name = "Kyc, enach & esign"
    //     existingPayload.message.order.items[0].xinput.head.headings[1] = "KYC_ENACH_ESIGN"
    // }
    // redirection to be done
    const submission_id = sessionData?.form_data?.E_sign_verification_status?.form_submission_id;

    if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
        if (submission_id) {
            existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS"

            existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
            console.log("Updated form_response with submission_id:", submission_id);
        } else {
            console.warn("⚠️ No submission_id found for E_sign_verification_status");
        }
    }

    // Ensure form ID matches from on_select
    const formId = sessionData.form_id;
    if (formId && existingPayload.message?.order?.items?.[0]?.xinput?.form) {
        existingPayload.message.order.items[0].xinput.form.id = formId;
    }


    console.log("=== on_select_2 Generator End ===");
    return existingPayload;
}
