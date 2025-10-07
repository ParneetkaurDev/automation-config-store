import { v4 as uuidv4 } from "uuid";

export async function onConfirmGenerator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.context.location.city.code = sessionData?.city_code;

  if (sessionData.items) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
    if (Array.isArray(existingPayload.message.order.fulfillments)) {
      existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
        fulfillment.state = {
          descriptor: {
            code: "INITIATED",
          },
        };
      });
    }
  }
  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider;
  }
  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }
  if (sessionData.payments) {
    const totalPrice =
      sessionData.quote?.price?.value ||
      existingPayload.message.order.quote?.price?.value ||
      1000;
    existingPayload.message.order.payments = sessionData.payments;
    existingPayload.message.order.payments.forEach((payment: any) => {
      payment.status = "PAID";
      payment.params = {
        transaction_id: uuidv4().replace(/-/g, ""),
        amount: totalPrice,
        currency: "INR",
      };
    });
  }

  if (sessionData.cancellation_terms) {
    existingPayload.message.order.cancellation_terms = [
      sessionData.cancellation_terms,
    ];
  }
  if (sessionData.quote) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  existingPayload.message.order.id = uuidv4().substring(0, 8); // Short UUID for order ID
  existingPayload.message.order.status = "ACTIVE";
  if (sessionData.created_at) {
    existingPayload.message.order.created_at =
      existingPayload.context.timestamp;
  }

  if (sessionData.updated_at) {
    existingPayload.message.order.updated_at =
      existingPayload.context.timestamp;
  }

  return existingPayload;
}
