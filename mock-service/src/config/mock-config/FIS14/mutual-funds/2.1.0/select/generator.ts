import { randomUUID } from "crypto";
import { SessionData } from "../../../session-types";

export async function selectDefaultGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {

  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = randomUUID();
  }
  const rawData = sessionData?.user_inputs?.data;

  let userInput;

  if (typeof rawData === "string") {
    try {
      userInput = JSON.parse(rawData);
    } catch (err) {
      console.error("Invalid JSON string:", err);
      userInput = {};
    }
  } else {
    userInput = rawData;
  }
  const fulfillment_ids = userInput?.message?.order?.fulfillments?.map(
    (fulfillment: any) => {
      return fulfillment?.id;
    },
  ) ?? [];
  existingPayload.message.order.provider =
    userInput?.message?.order?.provider ?? {};
  existingPayload.message.order.items =
    userInput?.message?.order?.items?.map((item: any) => {
      return {
        ...item,
        fulfillment_ids,
      };
    }) ?? [];
  existingPayload.message.order.fulfillments =
    userInput?.message?.order?.fulfillments ?? [];

  //Ading payment array for buyer flow

  if (sessionData?.flow_id === "Lumpsum_Payment_By_Buyer_App") {
    existingPayload.message.order.payments = [
      {
        "collected_by": "BAP",
        "status": "NOT-PAID",
        "type": "PRE_FULFILLMENT"
      }
    ]
  }

  // Update timestamp
  // if (existingPayload.context) {
  //   existingPayload.context.timestamp = new Date().toISOString();
  // }

  // // Map provider.id from session data (from on_search)
  // const selectedProvider =
  //   sessionData.selected_provider || sessionData.provider_id;
  // if (selectedProvider) {
  //   if (typeof selectedProvider === "string") {
  //     if (!existingPayload.message) existingPayload.message = {};
  //     if (!existingPayload.message.order) existingPayload.message.order = {};
  //     if (!existingPayload.message.order.provider)
  //       existingPayload.message.order.provider = {};
  //     existingPayload.message.order.provider.id = selectedProvider;
  //   } else if (selectedProvider.id) {
  //     if (!existingPayload.message) existingPayload.message = {};
  //     if (!existingPayload.message.order) existingPayload.message.order = {};
  //     if (!existingPayload.message.order.provider)
  //       existingPayload.message.order.provider = {};
  //     existingPayload.message.order.provider.id = selectedProvider.id;
  //   }
  //   console.log("Updated provider.id from session:", selectedProvider);
  // }

  // // Map item.id from session data
  // const selectedItem = sessionData.selected_item_id || sessionData.item;
  // if (selectedItem) {
  //   const item0 = existingPayload.message?.order?.items?.[0];
  //   if (item0) {
  //     if (typeof selectedItem === "string") {
  //       item0.id = selectedItem;
  //     } else if (selectedItem.id) {
  //       item0.id = selectedItem.id;
  //     }
  //     console.log("Updated item.id from session:", item0.id);
  //   }
  // }

  // // Update fulfillment IDs from session
  // if (
  //   sessionData.fulfillment_ids &&
  //   existingPayload.message?.order?.items?.[0]
  // ) {
  //   existingPayload.message.order.items[0].fulfillment_ids =
  //     sessionData.fulfillment_ids;
  // }

  // // Update investment details from session
  // if (
  //   sessionData.investment_amount &&
  //   existingPayload.message?.order?.items?.[0]?.tags
  // ) {
  //   const investmentTag = existingPayload.message.order.items[0].tags.find(
  //     (tag: any) =>
  //       tag.descriptor?.code === "CONTACT_INFO" ||
  //       tag.descriptor?.code === "INFO",
  //   );
  //   if (investmentTag && investmentTag.list) {
  //     const amountItem = investmentTag.list.find(
  //       (item: any) => item.descriptor?.code === "INVESTMENT_AMOUNT",
  //     );
  //     if (amountItem) {
  //       amountItem.value = sessionData.investment_amount;
  //       console.log(
  //         "Updated investment amount:",
  //         sessionData.investment_amount,
  //       );
  //     }
  //   }
  // }

  // console.log("=== select Generator End ===");
  return existingPayload;
}
