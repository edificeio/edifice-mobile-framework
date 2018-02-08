import React from "react"
import { AppNavigator } from "./AppNavigator"

// import { Tracking } from "../tracking/TrackingManager"

// Tracking.init()

export function getCurrentRoute(navigationState) {
	if (!navigationState) {
		return null
	}
	const route = navigationState.routes[navigationState.index]
	if (route.routes) {
		return getCurrentRoute(route)
	}
	return route
}

