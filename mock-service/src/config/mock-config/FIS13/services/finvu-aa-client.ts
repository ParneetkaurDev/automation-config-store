/**
 * Finvu AA Client Service for FIS12 Domain
 * Handles consent handler generation from automation-finvu-aa-service
 */

import axios, { AxiosError } from 'axios';

/**
 * Configuration for Finvu AA Service
 */
const FINVU_AA_SERVICE_CONFIG = {
  baseUrl: process.env.FINVU_AA_SERVICE_URL || 'http://localhost:3002',
  timeout: 30000, // 30 seconds
  retries: 2
};

/**
 * Response from Finvu AA Service consent generation
 */
export interface ConsentHandlerResponse {
  consentHandler: string;
  encryptedRequest: string;
  requestDate: string;
  encryptedFiuId: string;
  url: string;
}

/**
 * Request parameters for consent generation
 */
export interface ConsentGenerationRequest {
  custId: string;
  templateName?: string;
  fiTypes?: string[];
  consentDescription?: string;
}

/**
 * Finvu AA Client for FIS12 domain
 * Communicates with automation-finvu-aa-service
 */
export class FinvuAAClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = FINVU_AA_SERVICE_CONFIG.baseUrl;
    this.timeout = FINVU_AA_SERVICE_CONFIG.timeout;
  }

  /**
   * Generate consent handler from Finvu AA Service
   * 
   * @param custId - Customer identifier for Finvu
   * @param templateName - Optional template name (defaults to FINVUDEMO_PERIODIC)
   * @param fiTypes - Optional FI types array
   * @returns Promise<ConsentHandlerResponse>
   * @throws Error if service is unavailable or request fails
   */
  async generateConsentHandler(
    custId: string,
    templateName?: string,
    fiTypes?: string[]
  ): Promise<ConsentHandlerResponse> {
    try {
      console.log('[FinvuAAClient] Generating consent handler', {
        custId,
        templateName: templateName || 'default',
        serviceUrl: this.baseUrl
      });

      const requestBody: ConsentGenerationRequest = {
        custId,
        templateName: templateName || 'FINVUDEMO_PERIODIC',
        fiTypes: fiTypes || [
          'DEPOSIT',
          'INSURANCE_POLICIES',
          'RECURRING_DEPOSIT',
          'TERM-DEPOSIT',
          'MUTUAL_FUNDS'
        ]
      };

      const response = await axios.post<ConsentHandlerResponse>(
        `${this.baseUrl}/finvu-aa/consent/generate`,
        requestBody,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[FinvuAAClient] Consent handler generated successfully', {
        custId,
        consentHandler: response.data.consentHandler,
        url: response.data.url
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      console.error('[FinvuAAClient] Failed to generate consent handler', {
        custId,
        error: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });

      throw new Error(
        `Finvu AA Service error: ${axiosError.message}` +
        (axiosError.response?.status ? ` (HTTP ${axiosError.response.status})` : '')
      );
    }
  }

}

/**
 * Singleton instance for FIS12 domain
 */
export const finvuAAClient = new FinvuAAClient();

/**
 * Helper function to extract customer ID from session data
 * 
 * @param sessionData - Session data object
 * @returns Customer ID string
 */
export function extractCustomerId(sessionData: any): string {
  const phoneRaw = sessionData?.form_data?.consumer_information_form?.contactNumber;

  if (!phoneRaw || (typeof phoneRaw !== 'string' && typeof phoneRaw !== 'number')) {
    throw new Error(
      'Missing contactNumber in sessionData.form_data.consumer_information_form'
    );
  }

  const phone = String(phoneRaw).trim();
  console.log('[FinvuAAClient] Extracted phone number', `${phone}@finvu`);

  return `${phone}@finvu`;
}

/**
 * Helper function to inject consent handler into response payload
 * 
 * @param payload - Existing response payload
 * @param consentHandler - Consent handler UUID from Finvu
 * @returns Modified payload with consent handler
 */
export function injectConsentHandler(
  payload: any,
  consentHandler: string
): any {
  console.log('[FinvuAAClient] Injecting consent handler into payload', {
    consentHandler
  });

  // Navigate to items[0].tags
  if (!payload.message?.order?.items?.[0]?.tags) {
    console.warn('[FinvuAAClient] Invalid payload structure, cannot inject consent handler');
    return payload;
  }

  const items = payload.message.order.items[0];
  
  // Find or create CONSENT_INFO tag
  let consentInfoTag = items.tags.find(
    (tag: any) => tag.descriptor?.code === 'CONSENT_INFO'
  );

  if (!consentInfoTag) {
    console.log('[FinvuAAClient] Creating new CONSENT_INFO tag');
    consentInfoTag = {
      descriptor: {
        code: 'CONSENT_INFO',
        name: 'Consent Information'
      },
      list: [],
      display: false
    };
    items.tags.push(consentInfoTag);
  }

  // Find or create CONSENT_HANDLER item
  let consentHandlerItem = consentInfoTag.list?.find(
    (item: any) => item.descriptor?.code === 'CONSENT_HANDLER'
  );

  if (consentHandlerItem) {
    console.log('[FinvuAAClient] Updating existing CONSENT_HANDLER');
    consentHandlerItem.value = consentHandler;
  } else {
    console.log('[FinvuAAClient] Adding new CONSENT_HANDLER');
    consentInfoTag.list = consentInfoTag.list || [];
    consentInfoTag.list.push({
      descriptor: {
        code: 'CONSENT_HANDLER',
        name: 'Consent Handler'
      },
      value: consentHandler
    });
  }

  console.log('[FinvuAAClient] Consent handler injected successfully');
  return payload;
}

