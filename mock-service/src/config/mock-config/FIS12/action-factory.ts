// Gold Loan imports
import { MockSearchClass } from "./gold-loan/2.0.3/search/class";
import { MockOnSearchClass } from "./gold-loan/2.0.3/on_search/class";
import { MockSelectAdjustLoanAmountClass} from "./gold-loan/2.0.3/select_adjust_loan_amount/class";
import { MockSelect1Class } from "./gold-loan/2.0.3/select_1/class";
import { MockSelect2Class } from "./gold-loan/2.0.3/select_2/class";
import { MockOnSelectAdjustLoanAmountClass } from "./gold-loan/2.0.3/on_select_adjust_loan_amount/class";
import { MockOnSelect1Class } from "./gold-loan/2.0.3/on_select_1/class";
import { MockOnSelect2Class } from "./gold-loan/2.0.3/on_select_2/class";
import { MockInitClass } from "./gold-loan/2.0.3/init/class";
import { MockOnInitClass } from "./gold-loan/2.0.3/on_init/class";
import { MockConfirmClass } from "./gold-loan/2.0.3/confirm/class";
import { MockOnConfirmClass } from "./gold-loan/2.0.3/on_confirm/class";
import { MockUpdateClass } from "./gold-loan/2.0.3/update/class";
import { MockOnUpdateClass } from "./gold-loan/2.0.3/on_update/class";
import { MockOnUpdateUnsolicitedClass } from "./gold-loan/2.0.3/on_update_unsolicited/class";
import type { MockAction } from "./classes/mock-action";
import { MockStatusClass } from "./gold-loan/2.0.3/status/class";
import { MockOnStatusClass } from "./gold-loan/2.0.3/on_status/class";
import { MockOnStatusUnsolicitedClass } from "./gold-loan/2.0.3/on_status_unsolicited/class";

// Personal Loan imports

import { MockSearchCCClass } from "./credit-card/2.0.3/search/class";
import { MockOnSearchCCClass } from "./credit-card/2.0.3/on_search/class";
import { MockOnSelectCCClass } from "./credit-card/2.0.3/on_select/class";
import { MockSelectCCClass } from "./credit-card/2.0.3/select/class";
import { MockInitCCClass } from "./credit-card/2.0.3/init/class";
import { MockOnInitCCClass } from "./credit-card/2.0.3/on_init/class";
import { MockConfirmCCClass } from "./credit-card/2.0.3/confirm/class";
import { MockOnConfirmCCClass } from "./credit-card/2.0.3/on_confirm/class";
import { MockOnStatusUnsolicitedCCClass } from "./credit-card/2.0.3/on_status_unsolicited/class";
import { MockOnStatus1CCClass } from "./credit-card/2.0.3/on_status_1/class";
import { MockStatus1CCClass } from "./credit-card/2.0.3/status_1/class";
import { MockStatus2CCClass } from "./credit-card/2.0.3/status_2/class";
import { MockOnStatus2CCClass } from "./credit-card/2.0.3/on_status_2/class";
import { MockConsumerInformationFormCCClass } from "./credit-card/2.0.3/form/consumer_information_form";
import { MockKycVerificationStatusCCClass } from "./credit-card/2.0.3/form_2/kyc_verification_status";
import { MockSearchPersonalLoan3Class } from "./personal-loan/2.0.3/search/class";
import { MockOnSearchPersonalLoan3Class } from "./personal-loan/2.0.3/on_search/class";
import { MockSelectBureauConsentPersonalLoan3Class } from "./personal-loan/2.0.3/select_bureau_consent_personal_loan/class";
import { MockOnSelectBureauConsentPersonalLoan3Class } from "./personal-loan/2.0.3/on_select_bureau_consent_personal_loan/class";
import { MockSelect1PersonalLoan3Class } from "./personal-loan/2.0.3/select_1/class";
import { MockSelect2PersonalLoan3Class } from "./personal-loan/2.0.3/select_2/class";
import { MockOnSelect1PersonalLoan3Class } from "./personal-loan/2.0.3/on_select_1/class";
import { MockOnSelect2PersonalLoan3Class } from "./personal-loan/2.0.3/on_select_2/class";
import { MockSelect3PersonalLoan3Class } from "./personal-loan/2.0.3/select_3/class";
import { MockOnSelect3PersonalLoan3Class } from "./personal-loan/2.0.3/on_select_3/class";
import { MockConfirmPersonalLoan3Class } from "./personal-loan/2.0.3/confirm/class";
import { MockOnConfirmPersonalLoan3Class } from "./personal-loan/2.0.3/on_confirm/class";
import { MockUpdatePersonalLoan3Class } from "./personal-loan/2.0.3/update/class";
import { MockOnUpdatePersonalLoan3Class } from "./personal-loan/2.0.3/on_update/class";
import { MockOnUpdateUnsolicitedPersonalLoan3Class } from "./personal-loan/2.0.3/on_update_unsolicited/class";
import { MockStatusPersonalLoan3Class } from "./personal-loan/2.0.3/status/class";
import { MockOnStatusPersonalLoan3Class } from "./personal-loan/2.0.3/on_status/class";
import { MockOnStatusUnsolicitedPersonalLoan3Class } from "./personal-loan/2.0.3/on_status_unsolicited/class";
import { MockInitOfflinePersonalLoan3Class } from "./personal-loan/2.0.3/init_offline/class";
import { MockOnInitOfflinePersonalLoan3Class } from "./personal-loan/2.0.3/on_init_offline_personal_loan/class";
import { MockInitOfflineAndOnlinePersonalLoan3Class } from "./personal-loan/2.0.3/init_offline_and_online_personal_loan/class";
import { MockOnInitOfflineAndOnlinePersonalLoan3Class } from "./personal-loan/2.0.3/on_init_offline_and_online_personal_loan/class";
import { MockInit1PersonalLoan3Class } from "./personal-loan/2.0.3/init_1/class";
import { MockInit2PersonalLoan3Class } from "./personal-loan/2.0.3/init_2/class";
import { MockInit3PersonalLoan3Class } from "./personal-loan/2.0.3/init_3/class";
import { MockOnInit1PersonalLoan3Class } from "./personal-loan/2.0.3/on_init_1/class";
import { MockOnInit2PersonalLoan3Class } from "./personal-loan/2.0.3/on_init_2/class";
import { MockOnInit3PersonalLoan3Class } from "./personal-loan/2.0.3/on_init_3/class";
import { MockStatus1PersonalLoan3Class } from "./personal-loan/2.0.3/status_1/class";
import { MockOnStatus1PersonalLoan3Class } from "./personal-loan/2.0.3/on_status_1/class";
import { MockUpdatePersonalLoanFulfillment3Class } from "./personal-loan/2.0.3/update_personal_loan_fulfillment/class";
import { MockOnUpdatePersonalLoanFulfillment3Class } from "./personal-loan/2.0.3/on_update_personal_loan_fulfillment/class";
import { MockConsumerInformationForm3Class } from "./personal-loan/2.0.3/form/consumer_information_form";
import { MockKycVerificationStatus3Class } from "./personal-loan/2.0.3/form_2/kyc_verification_status";
import { MockLoanAdjustmentForm3Class } from "./personal-loan/2.0.3/loan-adjustment-form/loan-amount-adjustment-form";
import { MockMandateDetails3Form } from "./personal-loan/2.0.3/mandate-details-form/manadate-details-form";

type Ctor<T> = new () => T;

const registry = {

	// Gold Loan actions
	// search
    search: MockSearchClass,
	// on_search
	on_search: MockOnSearchClass,

	// select
	select_1: MockSelect1Class,
	select_2: MockSelect2Class,
	on_select_1: MockOnSelect1Class,
	on_select_2: MockOnSelect2Class,
	select_adjust_loan_amount: MockSelectAdjustLoanAmountClass,
	on_select_adjust_loan_amount: MockOnSelectAdjustLoanAmountClass,
	// init / on_init
	init: MockInitClass,
	on_init: MockOnInitClass,

	// confirm / on_confirm
	confirm: MockConfirmClass,
	on_confirm: MockOnConfirmClass,

	// status / on_status
	status: MockStatusClass,
	on_status: MockOnStatusClass,
	on_status_unsolicited: MockOnStatusUnsolicitedClass,

	// update / on_update
	update: MockUpdateClass,
	on_update: MockOnUpdateClass,
	on_update_unsolicited: MockOnUpdateUnsolicitedClass,
	// credit-card
    search_cc: MockSearchCCClass,
    on_search_cc: MockOnSearchCCClass,
    select_cc: MockSelectCCClass,
    on_select_cc: MockOnSelectCCClass,
    init_cc: MockInitCCClass,
    on_init_cc: MockOnInitCCClass,
    confirm_cc: MockConfirmCCClass,
    on_confirm_cc: MockOnConfirmCCClass,
    on_status_unsolicited_cc: MockOnStatusUnsolicitedCCClass,
    status_cc_1: MockStatus1CCClass,
    on_status_cc_1: MockOnStatus1CCClass,
    status_cc_2: MockStatus2CCClass,
    on_status_cc_2: MockOnStatus2CCClass,
    consumer_information_form_cc: MockConsumerInformationFormCCClass,
    Ekyc_details_form_cc: MockKycVerificationStatusCCClass,
	
	
    // PERSONAL_LAON-2.0.3
	// todo form
    consumer_information_form_pl: MockConsumerInformationForm3Class,
    loan_amount_adjustment_form_pl: MockLoanAdjustmentForm3Class,
    kyc_verification_status_pl: MockKycVerificationStatus3Class,
    manadate_details_form_pl: MockMandateDetails3Form,
	
	search_personal_loan_3: MockSearchPersonalLoan3Class,
	on_search_personal_loan_3: MockOnSearchPersonalLoan3Class,
	select_bureau_consent_personal_loan_3: MockSelectBureauConsentPersonalLoan3Class,
	on_select_bureau_consent_personal_loan_3: MockOnSelectBureauConsentPersonalLoan3Class,
	select_1_personal_loan_3: MockSelect1PersonalLoan3Class,
	select_2_personal_loan_3: MockSelect2PersonalLoan3Class,
	on_select_1_personal_loan_3: MockOnSelect1PersonalLoan3Class,
	on_select_2_personal_loan_3: MockOnSelect2PersonalLoan3Class,
	select_3_personal_loan_3: MockSelect3PersonalLoan3Class,
	on_select_3_personal_loan_3: MockOnSelect3PersonalLoan3Class,
	confirm_personal_loan_3: MockConfirmPersonalLoan3Class,
	on_confirm_personal_loan_3: MockOnConfirmPersonalLoan3Class,
	update_personal_loan_3: MockUpdatePersonalLoan3Class,
	on_update_personal_loan_3: MockOnUpdatePersonalLoan3Class,
	on_update_unsolicited_personal_loan_3: MockOnUpdateUnsolicitedPersonalLoan3Class,
	status_personal_loan_3: MockStatusPersonalLoan3Class,
	on_status_personal_loan_3: MockOnStatusPersonalLoan3Class,
	on_status_personal_loan_soft_3: MockOnStatusPersonalLoan3Class,
	on_status_unsolicited_personal_loan_3: MockOnStatusUnsolicitedPersonalLoan3Class,
	init_offline_personal_loan_3: MockInitOfflinePersonalLoan3Class,
	on_init_offline_personal_loan_3: MockOnInitOfflinePersonalLoan3Class,
	init_offline_and_online_personal_loan_3: MockInitOfflineAndOnlinePersonalLoan3Class,
	on_init_offline_and_online_personal_loan_3: MockOnInitOfflineAndOnlinePersonalLoan3Class,
	init_1_personal_loan_3: MockInit1PersonalLoan3Class,
	init_2_personal_loan_3: MockInit2PersonalLoan3Class,
	init_3_personal_loan_3: MockInit3PersonalLoan3Class,
	on_init_1_personal_loan_3: MockOnInit1PersonalLoan3Class,
	on_init_2_personal_loan_3: MockOnInit2PersonalLoan3Class,
	on_init_3_personal_loan_3: MockOnInit3PersonalLoan3Class,
	status_1_personal_loan_3: MockStatus1PersonalLoan3Class,
	on_status_1_personal_loan_3: MockOnStatus1PersonalLoan3Class,
	update_personal_loan_fulfillment_3: MockUpdatePersonalLoanFulfillment3Class,
	on_update_personal_loan_fulfillment_3: MockOnUpdatePersonalLoanFulfillment3Class,


} as const satisfies Record<string, Ctor<MockAction>>;

type MockActionId = keyof typeof registry;

// Construct by id
export function getMockAction(actionId: string): MockAction {
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
