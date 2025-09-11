import { MockSearchClass } from "./2.0.0/search/search/class";
import { MockOnSearchClass } from "./2.0.0/on_search/on_search/class";
import { MockSelectClass } from "./2.0.0/select/class";
import { MockOnSelectHospicashInsurencClass } from "./2.0.0/on_select/on_select_hospicash_insurence/class";
import { MockInitTransitInsurenceClass } from "./2.0.0/init/init_transit_insurence/class";
import { MockOnInitTransitClass } from "./2.0.0/on_init/on_init_transit_insurence/class";
import { MockConfirmTransitClass } from "./2.0.0/confirm/confirm_transit_insurence/class";
import { MockSearchInsurenceProviderClass } from "./2.0.0/search/search_insurence_provider/class";
import { MockOnSearchInsurenceProvidersClass } from "./2.0.0/on_search/on_search_insurence_providers/class";
import { MockSearchPurchaseJourneyTransitClass } from "./2.0.0/search/search_purchase_journey_transit/class";
import { MockOnSearchPurchaseJourneyTransitClass } from "./2.0.0/on_search/on_search_purchase_journey_transit/class";
import { MockOnSelectTransitInsurenceClass } from "./2.0.0/on_select/on_select_transit_insurence/class";
import { MockInitHospicashClass } from "./2.0.0/init/init_hospicash_insurence/class";
import { MockOnInitHospicashClass } from "./2.0.0/on_init/on_init_hospicash_insurence/class";
import { MockConfirmHospicashClass } from "./2.0.0/confirm/confirm_hospicash_insurence/class";
import { MockOnConfirmHospicashClass } from "./2.0.0/on_confirm/on_confirm_hospicash_insurence/class";
import { MockOnConfirmTransitClass } from "./2.0.0/on_confirm/on_confirm_transit_insurence/class";
import { MockOnupdateTransitClass } from "./2.0.0/on_update/on_update_transit/class";
import { MockOnupdateHospicashClass } from "./2.0.0/on_update/on_update_hospicash/class";
import { MockSearchPurchaseJourneyHospicashClass } from "./2.0.0/search/search_purchase_journey_hospicash/class";
import { MockOnSearchPurchaseJourneyHospicashClass } from "./2.0.0/on_search/on_search_purchase_journey_hospicash/class";
import { MockSearchDiscoverProductHospicashClass } from "./2.0.0/search/search_discover_products/search_discover_product_hospicash/class";
import { MockSearchDiscoverProductTransitClass } from "./2.0.0/search/search_discover_products/search_discover_product_transit/class";
import { MockOnSearchDiscoverHospicashClass } from "./2.0.0/on_search/on_search_discover_product/on_search_discover_product_hospicash/class";
import { MockOnSearchDiscoverTransitClass } from "./2.0.0/on_search/on_search_discover_product/on_search_discover_product_transit/class";
import { MockAction } from "./classes/mock-action";

// Type helper for constructor
type Ctor<T> = new () => T;

// Build a single source of truth registry
const registry = {
	// search
	search: MockSearchClass,
	search_purchase_journey_transit: MockSearchPurchaseJourneyTransitClass,
	search_purchase_journey_hospicash: MockSearchPurchaseJourneyHospicashClass,
	search_insurence_provider: MockSearchInsurenceProviderClass,
	search_discover_product_hospicash: MockSearchDiscoverProductHospicashClass,
	search_discover_product_transit: MockSearchDiscoverProductTransitClass,

	// on_search
	on_search_purchase_journey_hospicash: MockOnSearchPurchaseJourneyHospicashClass,
	on_search_purchase_journey_transit: MockOnSearchPurchaseJourneyTransitClass,
	on_search: MockOnSearchClass,
	on_search_insurence_provider: MockOnSearchInsurenceProvidersClass,
	on_search_discover_product_tranist: MockOnSearchDiscoverTransitClass,
	on_search_discover_product_hospicash: MockOnSearchDiscoverHospicashClass,

	// select / on_select
	select: MockSelectClass,
	on_select: MockOnSelectTransitInsurenceClass,
	on_select_hospicash: MockOnSelectHospicashInsurencClass,

	// init / on_init
	init: MockInitTransitInsurenceClass,
	init_hospicash: MockInitHospicashClass,
	on_init: MockOnInitTransitClass,
	on_init_hospicash: MockOnInitHospicashClass,

	// confirm / on_confirm
	confirm: MockConfirmTransitClass,
	confirm_hospicash: MockConfirmHospicashClass,
	on_confirm: MockOnConfirmTransitClass,
	on_confirm_hospicash: MockOnConfirmHospicashClass,

	// update / on_update
	on_update: MockOnupdateTransitClass,
	on_update_hospicash: MockOnupdateHospicashClass,
} as const satisfies Record<string, Ctor<MockAction>>;

type MockActionId = keyof typeof registry;

// Construct by id
export function getFIS13MockAction(actionId: string): MockAction {
	console.log("actionIdactionIdactionIdactionId", actionId);
	const Ctor = registry[actionId as MockActionId];
	if (!Ctor) {
		throw new Error(`Action with ID ${actionId} not found`);
	}
	return new Ctor();
}

// List all possible ids — stays in sync automatically
export function listFIS13MockActions(): MockActionId[] {
	return Object.keys(registry) as MockActionId[];
}