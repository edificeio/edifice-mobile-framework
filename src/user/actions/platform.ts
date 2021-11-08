import Conf from "../../../ode-framework-conf";
import userConfig from "../config";

import { createAppScopesLegacy, OAuth2RessourceOwnerPasswordClient } from "../../infra/oauth";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from "../../navigation/helpers/navHelper";
import { Trackers } from "../../framework/util/tracker";

export const PLATFORM_STORAGE_KEY = "currentPlatform";

export const actionTypePlatformSelect = userConfig.createActionType(
  "PLATFORM_SELECT"
);

/**
 * Sets the current selected platform.
 * Stores the new select platform Id in AsyncReducer.
 * @param platformId
 */
export function selectPlatform(platformId: string, redirect: boolean = false, doTrack: boolean = false) {
  return async (dispatch, getState) => {
    // === 1 - Verify that platformId exists
    if (!Conf.platforms.hasOwnProperty(platformId)) {
      throw new Error(`Error: platform "${platformId}" doesn't exists.`);
    }

    // === 2 - Sets the current selected platform in Conf
    Conf.currentPlatform = Conf.platforms[platformId];

    // === 3 - Instantiate the oAuth client
    OAuth2RessourceOwnerPasswordClient.connection = new OAuth2RessourceOwnerPasswordClient(
      `${Conf.currentPlatform.url}/auth/oauth2/token`,
      Conf.currentPlatform.appOAuthId,
      Conf.currentPlatform.appOAuthSecret,
      createAppScopesLegacy()
    );

    // === 4 - Dispatch the new selected platform in Redux Store
    dispatch({
      platformId,
      type: actionTypePlatformSelect
    });

    // === 5 - Track event
    doTrack && Trackers.trackEvent('Connection', 'SELECT PLATFORM', (Conf.currentPlatform as any).url.replace(/(^\w+:|^)\/\//, ''));

    // === End
    if (redirect) navigate("LoginHome", { platformId });
  };
}

/**
 * Read and select the platform stored in AsyncStorage.
 */
  export function loadCurrentPlatform() {
    return async (dispatch, getState) => {
      const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
      if (platformId) {
        if (!Conf.platforms.hasOwnProperty(platformId))
          throw new Error(
            `Error: LOADED platform "${platformId}" doesn't exists.`
          );
        else dispatch(selectPlatform(platformId));
        return platformId;
      } else {
        return platformId;
      }
    };
  }

/**
 * Goes to the platform selector page
 */
export function unSelectPlatform() {
  return async (dispatch, getState) => {
    navigate("PlatformSelect");
  };
}
