import logger from "@ondc/automation-logger";

export async function onSelect2Generator(existingPayload: any, sessionData: any) {
  logger.info(
    "[on_select_2] On Select2 generator - Available session data",
    {
      flow_id: sessionData?.flow_id,
      session_id: sessionData?.session_id,
      domain: sessionData?.domain,
      transaction_id: sessionData?.transaction_id,
    },
    {
      message_id: sessionData.message_id,
      selected_provider: !!sessionData.selected_provider,
      items: !!sessionData.items,
      selected_location_id: sessionData.selected_location_id,
      consent_handler_present: !!sessionData.consent_handler,
    }
  );

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

  // Ensure provider is an object (not an array)
  if (Array.isArray(existingPayload.message?.order?.provider)) {
    // Convert array to object (take first element)
    existingPayload.message.order.provider = existingPayload.message.order.provider[0] || {};
    logger.info(
      "[on_select_2] Converted provider array to object",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { provider_array_length: existingPayload.message.order.provider.length }
    );
  }

  // Update provider.id if available from session data (carry-forward from select_2)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    logger.info(
      "[on_select_2] Updated provider.id from session data",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { provider_id: sessionData.selected_provider.id }
    );
  }

  // Update item.id if available from session data (carry-forward from select_2)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    logger.info(
      "[on_select_2] Updated item.id from session data",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { item_id: selectedItem.id }
    );
  }

  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    logger.info(
      "[on_select_2] Updated location_ids from session data",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { location_id: selectedLocationId }
    );
  }

  // ========== CONSENT_INFO CARRY-FORWARD ==========
  // The consent_handler was generated in on_select_1 and stored in sessionData.
  // After the FINVU_REDIRECT step the user completes AA consent in the Finvu app.
  // We must carry the CONSENT_INFO/CONSENT_HANDLER tag into on_select_2 payload
  // so the BPP can verify/acknowledge the AA consent.
  const consentHandler = sessionData?.consent_handler;
  logger.info(
    "[on_select_2] Finvu CONSENT_INFO carry-forward check",
    {
      flow_id: sessionData?.flow_id,
      session_id: sessionData?.session_id,
      domain: sessionData?.domain,
      transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
    },
    { hasConsentHandlerInSession: !!consentHandler }
  );

  if (consentHandler && existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];

    if (!item.tags) {
      item.tags = [];
      logger.info(
        "[on_select_2] Initialized item.tags array",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        {}
      );
    }

    // Find or create CONSENT_INFO tag
    let consentInfoTag = item.tags.find((tag: any) =>
      tag.descriptor?.code === 'CONSENT_INFO'
    );

    if (!consentInfoTag) {
      consentInfoTag = {
        descriptor: {
          code: 'CONSENT_INFO',
          name: 'Consent Information'
        },
        list: [],
        display: false
      };
      item.tags.push(consentInfoTag);
      logger.info(
        "[on_select_2] Created new CONSENT_INFO tag in on_select_2 payload",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        {}
      );
    }

    if (!consentInfoTag.list) {
      consentInfoTag.list = [];
      logger.info(
        "[on_select_2] Initialized CONSENT_INFO tag list",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        {}
      );
    }

    // Find and update existing CONSENT_HANDLER or add new one
    const existingHandlerIndex = consentInfoTag.list.findIndex((listItem: any) =>
      listItem.descriptor?.code === 'CONSENT_HANDLER'
    );

    if (existingHandlerIndex >= 0) {
      consentInfoTag.list[existingHandlerIndex].value = consentHandler;
      logger.info(
        "[on_select_2] Updated existing CONSENT_HANDLER in on_select_2 payload",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        { index: existingHandlerIndex, consent_handler_value: consentHandler }
      );
    } else {
      consentInfoTag.list.push({
        descriptor: {
          code: 'CONSENT_HANDLER',
          name: 'Consent Handler'
        },
        value: consentHandler
      });
      logger.info(
        "[on_select_2] Added CONSENT_HANDLER to on_select_2 payload",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        { consent_handler_value: consentHandler }
      );
    }
  } else if (!consentHandler) {
    logger.info(
      "⚠️ [on_select_2] No consent_handler found in session data. FINVU_REDIRECT may not have completed or on_select_1 did not generate it.",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      {}
    );
  }

  // ========== FORM URL ==========
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/loan_amount_adjustment_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
    logger.info(
      "[on_select_2] Form URL successfully set in payload",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { form_url: url }
    );
  } else {
    logger.error(
      "[on_select_2] FAILED: Payload structure doesn't match expected path for form URL!",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { actual_order_structure: JSON.stringify(existingPayload.message?.order, null, 2) }
    );
  }

  logger.debug(
    "[on_select_2] Final session data state",
    {
      flow_id: sessionData?.flow_id,
      session_id: sessionData?.session_id,
      domain: sessionData?.domain,
      transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
    },
    { session_data: sessionData }
  );

  return existingPayload;
}
