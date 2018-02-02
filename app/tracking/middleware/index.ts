import { NavigationActions } from "react-navigation"
import { getCurrentRouteName } from "../../navigation"
import TrackingManager from "../TrackingManager"

const trackingMiddleware = ({ getState }) => next => action => {
	if (action.type !== NavigationActions.NAVIGATE) {
		TrackingManager.trackAction(action)
		return next(action)
	}

	const currentScreen = getCurrentRouteName(getState().navigation)
	const result = next(action)
	const nextScreen = getCurrentRouteName(getState().navigation)
	if (nextScreen !== currentScreen) {
		TrackingManager.trackScreenView(nextScreen, action.params)
	}
	return result
}

export default trackingMiddleware
