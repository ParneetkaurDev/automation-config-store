export async function onSearchInvoiceLoanGenerator(existingPayload: any, sessionData: any) {
    console.log("existingPayload on_search_invoice_loan", existingPayload, sessionData);


    // Set payment_collected_by if present in session data
    if (sessionData.collected_by && existingPayload.message?.catalog?.providers?.[0]?.payments?.[0]) {
        existingPayload.message.catalog.providers[0].payments[0].collected_by = sessionData.collected_by;
    }

    // Update message_id from session data
    if (sessionData.message_id) {
        if (!existingPayload.context) {
            existingPayload.context = {};
        }
        existingPayload.context.message_id = sessionData.message_id;
    }

    // Update form URLs for items with session data
    // if (existingPayload.message?.catalog?.providers?.[0]?.items) {
    //     existingPayload.message.catalog.providers[0].items = existingPayload.message.catalog.providers[0].items.map((item: any) => {
    //         if (item.xinput?.form) {
    //             const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/product_details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    //             console.log("Form URL generated:", url);
    //             item.xinput.form.id = "product_details_form";
    //             item.xinput.form.url = url;
    //         }
    //         return item;
    //     });
    // }

    return existingPayload;
}
