export async function onInitGenerator(existingPayload: any, sessionData: any) {
  let fulfillmentIds: string[] = [];
  let paymentIds: string[] = [];
  existingPayload.context.location.city.code = sessionData?.city_code;
  const buyerGender = sessionData?.user_tags[0]?.list?.find(
    (t: any) => t.descriptor?.code === "BUYER_GENDER"
  );

  const buyerEmail = sessionData?.user_tags[0]?.list?.find(
    (t: any) => t.descriptor?.code === "BUYER_EMAIL"
  );

  const buyerPhone = sessionData?.user_tags[0]?.list?.find(
    (t: any) => t.descriptor?.code === "BUYER_PHONE_NUMBER"
  );

  if (sessionData.fulfillments) {
    sessionData.fulfillments.map((fulfillment: any) => {
      fulfillmentIds.push(fulfillment.id);
      fulfillment.customer = {
        person: {
          name: sessionData?.person_name || "John Doe",
          dob: sessionData?.customer_dob || "2001-12-17",
          gender: buyerGender || "M",
        },
        contact: {
          phone: buyerPhone || "9090909090",
          email: buyerEmail || "John.doe@example.com",
        },
      };
    });
    existingPayload.message.order.fulfillments = sessionData.fulfillments.map(
      (fulfillment: { tags: any }) => {
        delete fulfillment.tags;
        return {
          ...fulfillment,
        };
      }
    );
  }

  if (sessionData.payments) {
    existingPayload.message.order.payments = sessionData.payments;
    existingPayload.message.order.payments.forEach(
      (payment: any, index: number) => {
        payment.id = `P${index}`;
        payment.url = `https://fis.test.bpp.io/pg-gateway/payment?amount=1000&txn_id=${payment.id}`;
        paymentIds.push(payment.id);
      }
    );
  }

  if (sessionData.items) {
    const itemTags = existingPayload.message.order.items[0].tags;
    existingPayload.message.order.items = sessionData.items;
    existingPayload.message.order.items.map((item: any) => {
      item.fulfillment_ids = fulfillmentIds;
      item.payment_ids = paymentIds;
      item.tags = itemTags;
      return item;
    });
  }

  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider;
  }

  if (sessionData.quote) {
    existingPayload.message.order.quote = sessionData.quote;
  }

  return existingPayload;
}
