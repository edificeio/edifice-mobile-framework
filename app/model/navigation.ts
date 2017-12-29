import { INIT_NAVIGATION } from "../constants/paths"
import AppNavigator from "../navigation"

const initialState = AppNavigator.router.getStateForAction(
	AppNavigator.router.getActionForPathAndParams("Nouveautes"),
	null
)

/**
 * Enregistrement dans le state Redux de l'objet navigation  de react-navigation
 *
 * @param {object} state    le state du reducer de navigation
 * @param {object} action   une action
 * @returns {*}  retourne un nouveau state
 */
export const Navigation = (state = initialState, action) => {
	if (action.type === INIT_NAVIGATION) return { ...initialState, ...action.navigation }
	const nextState = AppNavigator.router.getStateForAction(action, state)
	const newState = nextState || state

	if (action.routeName) return { ...newState, routeName: action.routeName }

	return newState
}
