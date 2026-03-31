import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";
import { updateChecklist } from '../utils/updateChecklist';

export async function on_update_unsolicitedDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_update_unsolicited Generator Start ===");

    // Update timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update IDs from session
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate new message_id for unsolicited callback
    if (existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
    }

    // Update order ID
    if (sessionData.order_id && existingPayload.message?.order) {
        existingPayload.message.order.id = sessionData.order_id;
    }

    if (existingPayload.message?.order) {
        const now = new Date().toISOString();
        existingPayload.message.order.created_at = sessionData?.order.created_at;
        existingPayload.message.order.updated_at = now;
    }
    // Override hardcoded timestamps from default.yaml with dynamic values
    const now = new Date().toISOString();
    if (existingPayload.message?.order) {
        existingPayload.message.order.created_at = now;
        existingPayload.message.order.updated_at = now;
    }

    console.log("=== on_update_unsolicited Generator End ===");

    const submission_id = sessionData?.form_data?.E_sign_verification_status?.form_submission_id || sessionData?.E_sign_verification_status

    if (existingPayload.message?.order?.xinput?.form_response) {
        if (submission_id) {
            existingPayload.message.order.xinput.form_response.status = "SUCCESS"

            existingPayload.message.order.xinput.form_response.submission_id = submission_id;
            console.log("Updated form_response with submission_id:", submission_id);
        } else {
            console.warn("⚠️ No submission_id found for E_sign_verification_status");
        }
    }

    // Ensure form ID matches from on_select
    const formId = sessionData?.form_id || "E_sign_verification_status";
    if (existingPayload.message?.order?.xinput?.form) {
        existingPayload.message.order.xinput.form.id = formId
    }

    // Update payment collected_by from session
    if (sessionData.payment_collected_by && existingPayload.message?.order?.payments?.[1]) {
        const paymentUrl = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/retry_payment_url_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
        existingPayload.message.order.payments[1].url = paymentUrl;

    }

    const updates = {
        APPLICATION_FORM_WITH_KYC: sessionData?.investor_details_form || "",
        KYC: sessionData.verification_status || "",
        ESIGN: sessionData.E_sign_verification_status || ""
    };

    const updatedOrder = updateChecklist(existingPayload.message.order, updates);
    existingPayload.message.order = updatedOrder
    return existingPayload;
}
