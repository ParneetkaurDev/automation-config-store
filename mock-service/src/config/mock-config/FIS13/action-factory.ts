import { MockSearchClass } from "./2.0.1/search/class";
import { MockOnSearchClass } from "./2.0.1/on_search/class";
import { MockOnSearchClass2 } from "./2.0.1/on_search2/class";
import { MockOnSearchClass3 } from "./2.0.1/on_search3/class";
import { MockSelectClass} from "./2.0.1/select/class";
import { MockOnSelectClass } from "./2.0.1/on_select/class";
import { MockInitClass } from "./2.0.1/init/class";
import { MockInitClass2 } from "./2.0.1/init2/class";
import { MockInitClass3 } from "./2.0.1/init3/class";
import { MockOnInitClass } from "./2.0.1/on_init/class";
import { MockOnInitClass2 } from "./2.0.1/on_init2/class";
import { MockOnInitClass3 } from "./2.0.1/on_init3/class";
import { MockConfirmClass } from "./2.0.1/confirm/class";
import { MockOnConfirmClass } from "./2.0.1/on_confirm/class";
import { MockUpdateClass } from "./2.0.1/update/class";
import { MockOnUpdateClass } from "./2.0.1/on_update/class";
import { MockOnUpdateUnsolicitedClass } from "./2.0.1/on_update_unsolicited/class";
import type { MockAction } from "./classes/mock-action";
import { MockConsumerInformationFormClass } from "./2.0.1/form6/consumer_information_form";
import { MockStatusClass } from "./2.0.1/status/class";
import { MockOnStatusClass } from "./2.0.1/on_status/class";
import { MockOnStatusUnsolicitedClass } from "./2.0.1/on_status_unsolicited/class";
import { MockIndividualInformationFormClass } from "./2.0.1/form/individual_information_form";
import { MockFamilyInformationFormClass } from "./2.0.1/form2/family_information_form";
import { MockEkycDetailsFormClass } from "./2.0.1/form3/Ekyc_details_form";
import { MockNomineeDetailsFormClass } from "./2.0.1/form5/nominee_details_form";
import { MockProposerDetailsFormClass } from "./2.0.1/form4/Proposer_Details_form";
import { MockCancelClass } from "./2.0.1/cancel/class";
import { MockOnCancelClass } from "./2.0.1/on_cancel/class";
import { MockOnUpdateUnsolicited2Class } from "./2.0.1/on_update_unsolicited2/class";
import { MockOnUpdateUnsolicited3Class } from "./2.0.1/on_update_unsolicited3/class";
import { MockOnUpdateUnsolicited4Class } from "./2.0.1/on_update_unsolicited4/class";
import { MockOnUpdateUnsolicited5Class } from "./2.0.1/on_update_unsolicited5/class";
import { MockOnStatusUnsolicited2Class } from "./2.0.1/on_status_unsolicited2/class";
import { MockOnUpdateUnsolicited6Class } from "./2.0.1/on_update_unsolicited6/class";
import { MockOnUpdateUnsolicited7Class } from "./2.0.1/on_update_unsolicited7/class";

// types/helpers
type Ctor<T> = new () => T;

// === keep your imports exactly as they are ===

// Build a single source of truth registry
const registry = {
	// search
	search: MockSearchClass,
	search2: MockSearchClass,
	search3: MockSearchClass,

	// on_search
	on_search: MockOnSearchClass,
	on_search2: MockOnSearchClass2,
	on_search3: MockOnSearchClass3,

	// select
	select: MockSelectClass,
	on_select: MockOnSelectClass,
	

	// init / on_init
	init: MockInitClass,
	init2: MockInitClass2,
	init3: MockInitClass3,
	on_init: MockOnInitClass,
	on_init2: MockOnInitClass2,
	on_init3: MockOnInitClass3,

	// confirm / on_confirm
	confirm: MockConfirmClass,
	on_confirm: MockOnConfirmClass,

	// status / on_status
	status: MockStatusClass,
	on_status: MockOnStatusClass,
	on_status_unsolicited: MockOnStatusUnsolicitedClass,
	on_status_unsolicited2: MockOnStatusUnsolicited2Class,

	// update / on_update
	update: MockUpdateClass,
	on_update: MockOnUpdateClass,
	on_update_unsolicited: MockOnUpdateUnsolicitedClass,
	on_update_unsolicited2: MockOnUpdateUnsolicited2Class,
	on_update_unsolicited3: MockOnUpdateUnsolicited3Class,
	on_update_unsolicited4: MockOnUpdateUnsolicited4Class,
	on_update_unsolicited5: MockOnUpdateUnsolicited5Class,
	on_update_unsolicited6: MockOnUpdateUnsolicited6Class,
	on_update_unsolicited7: MockOnUpdateUnsolicited7Class,

	//cancel
    cancel:MockCancelClass,
    on_cancel:MockOnCancelClass,
	//form
	individual_information_form: MockIndividualInformationFormClass,
	family_information_form: MockFamilyInformationFormClass,
	Ekyc_details_form: MockEkycDetailsFormClass,
	Proposer_Details_form: MockProposerDetailsFormClass,
	nominee_details_form: MockNomineeDetailsFormClass,
	consumer_information_form: MockConsumerInformationFormClass,
	

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
