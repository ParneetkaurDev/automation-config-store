import { randomUUID } from 'crypto';

export async function onSearchDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("existingPayload on search", existingPayload);

  // Set payment_collected_by if present in session data
  if (sessionData.collected_by && existingPayload.message?.catalog?.providers?.[0]?.payments?.[0]) {
    existingPayload.message.catalog.providers[0].payments[0].collected_by = sessionData.collected_by;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
  console.log("sessionData.message_id", sessionData);

  // Generate dynamic IDs for provider, items, and categories
  if (existingPayload.message?.catalog?.providers?.[0]) {
    const provider = existingPayload.message.catalog.providers[0];

    // Generate ONE form id for credit_card_information_form and apply to all items
    const creditCardInformationFormId =
      (typeof sessionData?.form_id === "string" && sessionData.form_id.trim()
        ? sessionData.form_id
        : `form_${randomUUID()}`);

    // Always generate a unique provider ID
    provider.id = `credit_card_provider_${randomUUID()}`;
    console.log("Generated provider.id:", provider.id);

    // Generate unique category IDs
    if (provider.categories && Array.isArray(provider.categories)) {
      const categoryIdMap: Record<string, string> = {};

      provider.categories = provider.categories.map((category: any) => {
        const oldId = category.id;
        const code = category.descriptor?.code || 'UNKNOWN';
        const newId = `cat_${code.toLowerCase()}_${randomUUID()}`;
        categoryIdMap[oldId] = newId;
        category.id = newId;
        console.log(`Generated category.id: ${oldId} -> ${newId} (${code})`);
        return category;
      });

      // Update parent_category_id references
      provider.categories.forEach((category: any) => {
        if (category.parent_category_id && categoryIdMap[category.parent_category_id]) {
          const oldParent = category.parent_category_id;
          category.parent_category_id = categoryIdMap[oldParent];
          console.log(`Updated parent_category_id: ${oldParent} -> ${category.parent_category_id}`);
        }
      });

      // Update category_ids in items to match new category IDs
      if (provider.items && Array.isArray(provider.items)) {
        provider.items.forEach((item: any) => {
          if (item.category_ids && Array.isArray(item.category_ids)) {
            item.category_ids = item.category_ids.map((catId: string) => {
              if (categoryIdMap[catId]) {
                console.log(`Updated item category_id: ${catId} -> ${categoryIdMap[catId]}`);
                return categoryIdMap[catId];
              }
              return catId;
            });
          }
        });
      }
    }

    // Generate item IDs if they are placeholders
    if (provider.items && Array.isArray(provider.items)) {
      provider.items = provider.items.map((item: any) => {
        if (!item.id || item.id.startsWith("ITEM_ID_")) {
          item.id = `credit_card_${randomUUID()}`;
          console.log("Generated item.id:", item.id);
        }

        // Update form ID and generate dynamic form URL for items with xinput
        if (item.xinput?.form) {
          item.xinput.form.id = creditCardInformationFormId;
          console.log("Using credit_card_information_form form.id:", item.xinput.form.id);

          // Generate dynamic form URL with session data
          const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/credit_card_information_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
          console.log("Form URL generated:", url);
          item.xinput.form.url = url;
        }

        return item;
      });
    }
  }

  console.log("session data of on_search", sessionData);
  return existingPayload;
}