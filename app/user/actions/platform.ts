import Conf from "../../Conf";
import userConfig from "../config";

import { OAuth2RessourceOwnerPasswordClient, scopes } from "../../infra/oauth";

import { AsyncStorage } from "react-native";

export const PLATFORM_STORAGE_KEY = "currentPlatform";

export const actionTypePlatformSelect = userConfig.createActionType(
  "PLATFORM_SELECT"
);

/**
 * Sets the current selected platform.
 * Stores the new select platform Id in AsyncReducer.
 * @param platformId
 */
export function selectPlatform(platformId: string) {
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
      scopes
    );

    // === 4 - Saves the selected platform in Async Storage
    await AsyncStorage.setItem(PLATFORM_STORAGE_KEY, platformId);

    // === 5 - Dispatch the new selected platform in Redux Store
    dispatch({
      platformId,
      type: actionTypePlatformSelect
    });

    console.log(`Switched to platform "${platformId}"`);
  };
}

/**
 * Read ans select the platform stored in AsyncStorage.
 */
export function loadCurrentPlatform() {
  return async (dispatch, getState) => {
    const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
    if (!Conf.platforms.hasOwnProperty(platformId)) {
      throw new Error(`Error: LOADED platform "${platformId}" doesn't exists.`);
    }
    dispatch(selectPlatform(platformId));
  };
}
