// Mutual Funds 2.1.0 imports
import { MockSearchClass } from "./mutual-funds/2.1.0/search/class";
import { MockOnSearchClass } from "./mutual-funds/2.1.0/on_search/class";
import { MockSelectClass } from "./mutual-funds/2.1.0/select/class";
import { MockOnSelectClass } from "./mutual-funds/2.1.0/on_select/class";
import { MockOnSelectExistingFolioClass } from "./mutual-funds/2.1.0/on_select_existing_folio/class";
import { MockSelect_2Class } from "./mutual-funds/2.1.0/select_2/class";
import { MockOnSelect_2Class } from "./mutual-funds/2.1.0/on_select_2/class";
import { MockInitClass } from "./mutual-funds/2.1.0/init/class";
import { MockOnInitClass } from "./mutual-funds/2.1.0/on_init/class";
import { MockConfirmClass } from "./mutual-funds/2.1.0/confirm/class";
import { MockOnConfirmClass } from "./mutual-funds/2.1.0/on_confirm/class";
import { MockOnStatusUnsolicitedClass } from "./mutual-funds/2.1.0/on_status_unsolicited/class";
import { MockOnUpdateUnsolicitedClass } from "./mutual-funds/2.1.0/on_update_unsolicited/class";
import { MockOnStatusClass } from "./mutual-funds/2.1.0/on_status/class";
import { MockOnUpdateClass } from "./mutual-funds/2.1.0/on_update/class";
import { MockInvestorDetailsFormClass } from "./mutual-funds/2.1.0/investor_details_form/investor_details_form"
import type { MockAction } from "../FIS14/classes/mock-action";
import { MockOnSearchIncrementClass } from "./mutual-funds/2.1.0/on_search_incremental_pull/class";
import { MockSearchIncrementClass } from "./mutual-funds/2.1.0/search_incremental_pull/class";
import { MockSelectFinalClass } from "./mutual-funds/2.1.0/select_final/class";
import { MockOnSelectEsignClass } from "./mutual-funds/2.1.0/on_select_esign/class";
import { MockSelectEsignClass } from "./mutual-funds/2.1.0/select_esign/class";
import { MockOnSelectFinalClass } from "./mutual-funds/2.1.0/on_select_final/class";
import { MockVerificationStatusFormClass } from "./mutual-funds/2.1.0/verification_status/verification_status";
import { MockESignVerificationStatusFormClass } from "./mutual-funds/2.1.0/E_sign_verification_status/E_sign_verification_status";

type Ctor<T> = new () => T;

const registry = {
    // Mutual Funds 2.1.0 actions
    search: MockSearchClass,
    search_incremental_pull: MockSearchIncrementClass,

    // on_search
    on_search: MockOnSearchClass,
    on_search_incremental_pull: MockOnSearchIncrementClass,

    // select
    select: MockSelectClass,
    on_select: MockOnSelectClass,
    on_select_existing_folio: MockOnSelectExistingFolioClass,
    select_2: MockSelect_2Class,
    on_select_2: MockOnSelect_2Class,
    select_esign: MockOnSelectEsignClass,
    select_final: MockSelectFinalClass,
    on_select_esign: MockSelectEsignClass,
    on_select_final: MockOnSelectFinalClass,
    verification_status: MockVerificationStatusFormClass,
    E_sign_verification_status: MockESignVerificationStatusFormClass,
    // init / on_init
    init: MockInitClass,
    on_init: MockOnInitClass,

    // confirm / on_confirm
    confirm: MockConfirmClass,
    on_confirm: MockOnConfirmClass,

    // solicited status/update
    on_status: MockOnStatusClass,
    on_update: MockOnUpdateClass,

    // unsolicited callbacks
    on_status_unsolicited: MockOnStatusUnsolicitedClass,
    on_status_esign_unsolicited: MockOnStatusUnsolicitedClass,
    on_update_unsolicited: MockOnUpdateUnsolicitedClass,

    // forms
    investor_details_form: MockInvestorDetailsFormClass,

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
