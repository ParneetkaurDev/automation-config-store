
import type { MockAction } from "./classes/mock-action";
import { MockManadateDetailsFormClass } from "./2.3.0/personal_loan/Emanadate_verification_status/Emanadate_verification_status";
import { MockEkycDetailsFormClass } from "./2.3.0/personal_loan/kyc_form_verification_status/kyc_form_verification_status";
import { MockMasterSearchClass } from "./2.3.0/master_search/class";
import { MockMasterOnSearchClass } from "./2.3.0/master_on_search/class";
import { MockSearchPersonalLoanClass } from "./2.3.0/personal_loan/search_personal_loan/class";
import { MockSearchPersonalLoan2Class } from "./2.3.0/personal_loan/search_personal_loan_2/class";
import { MockSearchPersonalLoan3Class } from "./2.3.0/personal_loan/search_personal_loan_3/class";

import { MockOnSearchPersonalLoanClass } from "./2.3.0/personal_loan/on_search_personal_loan/class";
import { MockOnSearchPersonalLoan2Class } from "./2.3.0/personal_loan/on_search_personal_loan_2/class";
import { MockSelect1PersonalLoanClass } from "./2.3.0/personal_loan/select_1_personal_loan/class";
import { MockSelect2PersonalLoanClass } from "./2.3.0/personal_loan/select_2_personal_loan/class";
import { MockOnSelect1PersonalLoanClass } from "./2.3.0/personal_loan/on_select_1_personal_loan/class";
import { MockOnSelect2PersonalLoanClass } from "./2.3.0/personal_loan/on_select_2_personal_loan/class";
import { MockInit1PersonalLoanClass } from "./2.3.0/personal_loan/init_1_personal_loan/class";
import { MockInit2PersonalLoanClass } from "./2.3.0/personal_loan/init_2_personal_loan/class";
import { MockInit3PersonalLoanClass } from "./2.3.0/personal_loan/init_3_personal_loan/class";
import { MockInit4PersonalLoanClass } from "./2.3.0/personal_loan/init_4_personal_loan/class";
import { MockOnInit1PersonalLoanClass } from "./2.3.0/personal_loan/on_init_1_personal_loan/class";
import { MockOnInit2PersonalLoanClass } from "./2.3.0/personal_loan/on_init_2_personal_loan/class";
import { MockOnInit3PersonalLoanClass } from "./2.3.0/personal_loan/on_init_3_personal_loan/class";
import { MockOnInit4PersonalLoanClass } from "./2.3.0/personal_loan/on_init_4_personal_loan/class";
import { MockConfirmPersonalLoanClass } from "./2.3.0/personal_loan/confirm_personal_loan/class";
import { MockOnConfirmPersonalLoanClass } from "./2.3.0/personal_loan/on_confirm_personal_loan/class";
import { MockStatusPersonalLoanClass } from "./2.3.0/personal_loan/status_personal_loan/class";
import { MockOnStatusPersonalLoanClass } from "./2.3.0/personal_loan/on_status_personal_loan/class";
import { MockOnStatusUnsolicitedPersonalLoanClass } from "./2.3.0/personal_loan/on_status_unsolicited_personal_loan/class";
import { MockUpdatePersonalLoanFulfillmentClass } from "./2.3.0/personal_loan/update_personal_loan_items/class";
import { MockOnUpdatePersonalLoanFulfillmentClass } from "./2.3.0/personal_loan/on_update_personal_loan_items/class";
import { MockOnUpdateUnsolicitedPersonalLoanClass } from "./2.3.0/personal_loan/on_update_unsolicited_personal_loan/class";
import { MockLoanAggrementVerificationStatusClass } from "./2.3.0/personal_loan/loan_aggrement_verification_status/loan_aggrement_verification_status";
import { MockOnSearchPersonalLoan3Class } from "./2.3.0/personal_loan/on_search_personal_loan_3/class";
import { MockUpdateMissedEmiClass } from "./2.3.0/update_missed_Emi/class";
import { MockUpdateForeclosureClass } from "./2.3.0/update_foreclosure/class";
import { MockUpdatePrepartClass } from "./2.3.0/update_prepart/class";
import { MockOnUpdateMissedEmiClass } from "./2.3.0/on_update_missed_Emi/class";
import { MockOnUpdateForeclosureClass } from "./2.3.0/on_update_foreclosure/class";
import { MockOnUpdatePrepartClass } from "./2.3.0/on_update_prepart/class";
import { MockOnUpdateUnsolicitedMissedEmiClass } from "./2.3.0/on_update_unsolicited_missed_Emi/class";
import { MockOnUpdateUnsolicitedForeclosureClass } from "./2.3.0/on_update_unsolicited_foreclosure/class";
import { MockOnUpdateUnsolicitedPrepartClass } from "./2.3.0/on_update_unsolicited_prepart/class";
import { MockSearchPersonalLoan4Class } from "./2.3.0/personal_loan/search_personal_loan_4/class";
import { MockOnSearchPersonalLoan4Class } from "./2.3.0/personal_loan/on_search_personal_loan_4/class";
import { MockSearchPersonalLoan5Class } from "./2.3.0/personal_loan/search_personal_loan_5/class";
import { MockOnSearchPersonalLoan5Class } from "./2.3.0/personal_loan/on_search_personal_loan_5/class";
import { MockEntityEkycDetailsFormClass } from "./2.3.0/invoice_loan/entity_kyc_form_verification_status/entity_kyc_form_verification_status";
import { MockSearchInvoiceLoanClass } from "./2.3.0/invoice_loan/search_invoice_loan/class";
import { MockOnSearchInvoiceLoanClass } from "./2.3.0/invoice_loan/on_search_invoice_loan/class";
import { MockOnSearchInvoiceLoan2Class } from "./2.3.0/invoice_loan/on_search_invoice_loan_2/class";
import { MockSearchInvoiceLoan2Class } from "./2.3.0/invoice_loan/search_invoice_loan_2/class";
import { MockSelect1InvoiceLoanClass } from "./2.3.0/invoice_loan/select_1_invoice_loan/class";
import { MockOnSelect1InvoiceLoanClass } from "./2.3.0/invoice_loan/on_select_1_invoice_loan/class";
import { MockSelect2InvoiceLoanClass } from "./2.3.0/invoice_loan/select_2_invoice_loan/class";
import { MockOnSelect2InvoiceLoanClass } from "./2.3.0/invoice_loan/on_select_2_invoice_loan/class";
import { MockInit1InvoiceLoanClass } from "./2.3.0/invoice_loan/init_1_invoice_loan/class";
import { MockConfirmInvoiceLoanClass } from "./2.3.0/invoice_loan/confirm_invoice_loan/class";
import { MockInit2InvoiceLoanClass } from "./2.3.0/invoice_loan/init_2_invoice_loan/class";
import { MockInit3InvoiceLoanClass } from "./2.3.0/invoice_loan/init_3_invoice_loan/class";
import { MockInit4InvoiceLoanClass } from "./2.3.0/invoice_loan/init_4_invoice_loan/class";
import { MockOnConfirmInvoiceLoanClass } from "./2.3.0/invoice_loan/on_confirm_invoice_loan/class";
import { MockOnInit1InvoiceLoanClass } from "./2.3.0/invoice_loan/on_init_1_invoice_loan/class";
import { MockOnInit2InvoiceLoanClass } from "./2.3.0/invoice_loan/on_init_2_invoice_loan/class";
import { MockOnInit3InvoiceLoanClass } from "./2.3.0/invoice_loan/on_init_3_invoice_loan/class";
import { MockOnInit4InvoiceLoanClass } from "./2.3.0/invoice_loan/on_init_4_invoice_loan/class";
import { MockOnInit5InvoiceLoanClass } from "./2.3.0/invoice_loan/on_init_5_invoice_loan/class";
import { MockOnStatusInvoiceLoanClass } from "./2.3.0/invoice_loan/on_status_invoice_loan/class";
import { MockOnStatusUnsolicitedInvoiceLoanClass } from "./2.3.0/invoice_loan/on_status_unsolicited_invoice_loan/class";
import { MockStatusInvoiceLoanClass } from "./2.3.0/invoice_loan/status_invoice_loan/class";
import { MockInit5InvoiceLoanClass } from "./2.3.0/invoice_loan/init_5_invoice_loan/class";

// types/helpers
type Ctor<T> = new () => T;

// === keep your imports exactly as they are ===

// Build a single source of truth registry
const registry = {
	// search
	master_search_unified_credit: MockMasterSearchClass,
	master_on_search_unified_credit: MockMasterOnSearchClass,
	Emanadate_verification_status: MockManadateDetailsFormClass,
	kyc_form_verification_status: MockEkycDetailsFormClass,
	loan_aggrement_verification_status: MockLoanAggrementVerificationStatusClass,
	entity_kyc_form_verification_status: MockEntityEkycDetailsFormClass,
	// ========== PERSONAL LOAN FLOWS ==========
	// search / on_search
	search_personal_loan: MockSearchPersonalLoanClass,
	on_search_personal_loan: MockOnSearchPersonalLoanClass,
	search_personal_loan_2: MockSearchPersonalLoan2Class,
	on_search_personal_loan_2: MockOnSearchPersonalLoan2Class,
	search_personal_loan_3: MockSearchPersonalLoan3Class,
	on_search_personal_loan_3: MockOnSearchPersonalLoan3Class,
	search_personal_loan_4: MockSearchPersonalLoan4Class,
	on_search_personal_loan_4: MockOnSearchPersonalLoan4Class,
	search_personal_loan_5: MockSearchPersonalLoan5Class,
	on_search_personal_loan_5: MockOnSearchPersonalLoan5Class,

	// select / on_select
	select_1_personal_loan: MockSelect1PersonalLoanClass,
	on_select_1_personal_loan: MockOnSelect1PersonalLoanClass,
	select_2_personal_loan: MockSelect2PersonalLoanClass,
	on_select_2_personal_loan: MockOnSelect2PersonalLoanClass,

	// init / on_init
	init_1_personal_loan: MockInit1PersonalLoanClass,
	on_init_1_personal_loan: MockOnInit1PersonalLoanClass,
	init_2_personal_loan: MockInit2PersonalLoanClass,
	on_init_2_personal_loan: MockOnInit2PersonalLoanClass,
	init_3_personal_loan: MockInit3PersonalLoanClass,
	on_init_3_personal_loan: MockOnInit3PersonalLoanClass,
	init_4_personal_loan: MockInit4PersonalLoanClass,
	on_init_4_personal_loan: MockOnInit4PersonalLoanClass,

	// confirm / on_confirm
	confirm_personal_loan: MockConfirmPersonalLoanClass,
	on_confirm_personal_loan: MockOnConfirmPersonalLoanClass,

	// status / on_status
	status_personal_loan: MockStatusPersonalLoanClass,
	on_status_personal_loan: MockOnStatusPersonalLoanClass,
	on_status_unsolicited_personal_loan: MockOnStatusUnsolicitedPersonalLoanClass,

	// update / on_update
	update_personal_loan_items: MockUpdatePersonalLoanFulfillmentClass,
	on_update_personal_loan_items: MockOnUpdatePersonalLoanFulfillmentClass,
	on_update_unsolicited_personal_loan: MockOnUpdateUnsolicitedPersonalLoanClass,

	//foreclosure
	update_missed_Emi: MockUpdateMissedEmiClass,
	update_foreclosure: MockUpdateForeclosureClass,
	update_prepart: MockUpdatePrepartClass,

	on_update_missed_Emi: MockOnUpdateMissedEmiClass,
	on_update_foreclosure: MockOnUpdateForeclosureClass,
	on_update_prepart: MockOnUpdatePrepartClass,

	on_update_unsolicited_missed_Emi: MockOnUpdateUnsolicitedMissedEmiClass,
	on_update_unsolicited_foreclosure: MockOnUpdateUnsolicitedForeclosureClass,
	on_update_unsolicited_prepart: MockOnUpdateUnsolicitedPrepartClass,


	//Invoice loan 
	search_invoice_loan: MockSearchInvoiceLoanClass,
	on_search_invoice_loan: MockOnSearchInvoiceLoanClass,
	search_invoice_loan_2: MockSearchInvoiceLoan2Class,
	on_search_invoice_loan_2: MockOnSearchInvoiceLoan2Class,

	// select / on_select
	select_1_invoice_loan: MockSelect1InvoiceLoanClass,
	on_select_1_invoice_loan: MockOnSelect1InvoiceLoanClass,
	select_2_invoice_loan: MockSelect2InvoiceLoanClass,
	on_select_2_invoice_loan: MockOnSelect2InvoiceLoanClass,

	// init / on_init
	init_1_invoice_loan: MockInit1InvoiceLoanClass,
	on_init_1_invoice_loan: MockOnInit1InvoiceLoanClass,
	init_2_invoice_loan: MockInit2InvoiceLoanClass,
	on_init_2_invoice_loan: MockOnInit2InvoiceLoanClass,
	init_3_invoice_loan: MockInit3InvoiceLoanClass,
	on_init_3_invoice_loan: MockOnInit3InvoiceLoanClass,
	init_4_invoice_loan: MockInit4InvoiceLoanClass,
	on_init_4_invoice_loan: MockOnInit4InvoiceLoanClass,
	init_5_invoice_loan: MockInit5InvoiceLoanClass,
	on_init_5_invoice_loan: MockOnInit5InvoiceLoanClass,
	// confirm / on_confirm
	confirm_invoice_loan: MockConfirmInvoiceLoanClass,
	on_confirm_invoice_loan: MockOnConfirmInvoiceLoanClass,

	// status / on_status
	status_invoice_loan: MockStatusInvoiceLoanClass,
	on_status_invoice_loan: MockOnStatusInvoiceLoanClass,
	on_status_unsolicited_invoice_loan: MockOnStatusUnsolicitedInvoiceLoanClass,

} as const satisfies Record<string, Ctor<MockAction>>;

type MockActionId = keyof typeof registry;

// Construct by id
export function getMockAction(actionId: string): MockAction {
	console.log('actionId==>>>>>>>>>>>>>>>>', actionId)
	const Ctor = registry[actionId as MockActionId];
	if (!Ctor) {
		throw new Error(`Action with ID ${actionId as string} not found`);
	}
	return new Ctor();
}

// List all possible ids — stays in sync automatically
export function listMockActions(): MockActionId[] {
	return Object.keys(registry) as MockActionId[];
}
