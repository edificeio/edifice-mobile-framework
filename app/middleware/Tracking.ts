import { Tracking } from "../tracking/TrackingManager"

export default store => next => action => {
	const returnValue = next(action)

	if (
		action.type.indexOf("CREATE_") === 0 ||
		action.type.indexOf("DELETE_") === 0 ||
		action.type.indexOf("UPDATE_") === 0
	)
		Tracking.trackAction(action)

	return returnValue
}
