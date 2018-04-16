import { storeFilters } from "./storedFilters";
import { listTimeline } from "./list";

export const pickFilters = dispatch => (selectedApps) => {
	dispatch({
		type: "PICK_FILTER_TIMELINE",
		selectedApps: selectedApps
	});
}

export const setFilters = dispatch => (availableApps) => {
	dispatch({
		type: "FILTER_TIMELINE",
		availableApps: availableApps
	});

	storeFilters(availableApps);
	listTimeline(dispatch)(0, availableApps);
}