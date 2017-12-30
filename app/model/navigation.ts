import {AppNavigator} from "../navigation"
import {INIT_NAVIGATION} from "../constants/paths";

const initialState = {
    navigation: null
}

/**
 * Enregistrement dans le state Redux de l'objet navigation  de react-navigation
 *
 * @param {object} state    le state du reducer de navigation
 * @param {object} action   une action
 * @returns {*}  retourne un nouveau state
 */
export const Navigation = (state = initialState, action) => {
    if (action.type === INIT_NAVIGATION) return { ...initialState, ...action.navigation }

    return state;
}
