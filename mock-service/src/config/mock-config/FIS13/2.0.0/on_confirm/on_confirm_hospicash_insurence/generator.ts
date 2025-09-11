import { v4 as uuidv4 } from "uuid";

export async function onConfirmGenerator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.context.location.city.code = sessionData?.city_code;

  const currentTime = new Date(new Date());
  const policy_tags = {
    descriptor: {
      code: "POLICY_INFO",
      name: "Policy Info",
    },
    list: [
      {
        descriptor: {
          code: "POLICY_START_DATE",
          name: "Policy Start Date",
        },
        value: new Date().toISOString().split('T')[0],
      },
      {
        descriptor: {
          code: "POLICY_END_DATE",
          name: "Policy End Date",
        },
        value: new Date(currentTime.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        descriptor: {
          code: "POLICY_RENEWAL_DATE",
          name: "Policy Renewal Date",
        },
        value: new Date(currentTime.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        descriptor: {
          code: "CLAIMS_HELPDESK_CONTACT_NUMBER",
          name: "Claims Helpdesk - Contact Number",
        },
        value: "1860 266 7766",
      },
      {
        descriptor: {
          code: "CLAIMS_HELPDESK_EMAIL_ID",
          name: "Claims Helpdesk - Email ID",
        },
        value: "helpdesk@fistestbpp.com",
      },
    ],
  };

  if (sessionData.items) {
    existingPayload.message.order.items = sessionData.items;
    existingPayload.message.order.items.forEach((item: any) => {
      item.tags.push(policy_tags)
    });
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
