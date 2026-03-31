import { randomUUID } from 'crypto';
import { updateChecklist } from '../utils/updateChecklist';

export async function on_status_unsolicitedDefaultGenerator(
    existingPayload: any,
    sessionData: any
) {
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    console.log("sessionData for on_status", sessionData);

    // Update transaction_id and message_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = randomUUID();
    }

    // Update provider information from session data (carry-forward from previous flows)
    if (sessionData?.order) {
        sessionData.order.payments = existingPayload.message.order.payments
        sessionData.order.fulfillments = existingPayload.message.order.fulfillments

        existingPayload.message.order = sessionData?.order || {};
    }

    // Set created_at and updated_at to current timestamp
    if (existingPayload.message?.order) {
        const now = new Date().toISOString();
        existingPayload.message.order.created_at = sessionData.order.created_at;
        existingPayload.message.order.updated_at = now;
    }

    if (existingPayload?.message?.order?.payments) {
        existingPayload.message.order.payments[0].status = sessionData?.form_data?.payment_url_form?.idType ? sessionData?.form_data?.payment_url_form?.idType : 'PAID'
    }

    return existingPayload;
}
