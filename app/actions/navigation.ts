import { INIT_NAVIGATION, NAVIGATE } from '../constants/paths'

/**
 * Pour avoir les informations de navigation dans le state Redux.
 * La solution préconisé par Facebook ralentit considerablement le systeme, d'ou cette solution qui semble bien marché.
 *
 * @param {objec} navigation    l'objet navigation de react-navigation
 */
export const initNavigationState = navigation => ({
    type: INIT_NAVIGATION,
    navigation,
})

export const navigate = (screen, props) => ({
    type: NAVIGATE,
    screen,
    props,
})
