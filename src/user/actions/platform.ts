import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEPRECATED_setCurrentPlatform } from '~/framework/util/_legacy_appConf';
import appConf from '~/framework/util/appConf';
import { Trackers } from '~/framework/util/tracker';
import { OAuth2RessourceOwnerPasswordClient, createAppScopesLegacy } from '~/infra/oauth';
import { getLoginRouteName } from '~/navigation/helpers/loginRouteName';
import { navigate } from '~/navigation/helpers/navHelper';
import userConfig from '~/user/config';

export const PLATFORM_STORAGE_KEY = 'currentPlatform';

export const actionTypePlatformSelect = userConfig.createActionType('PLATFORM_SELECT');

/**
 * Sets the current selected platform.
 * Stores the new select platform Id in AsyncReducer.
 * @param platformId
 */
export function selectPlatform(platformId: string, redirect: boolean = false, doTrack: boolean = false) {
  return async (dispatch, getState) => {
    // === 1 - Verify that platformId exists
    const selectedPf = appConf.platforms.find(pf => pf.name === platformId);
    if (!selectedPf) {
      throw new Error(`Error: platform "${platformId}" doesn't exists.`);
    }
    // === 2 - Sets the current selected platform in Conf
    DEPRECATED_setCurrentPlatform(selectedPf);
    // === 3 - Instantiate the oAuth client
    OAuth2RessourceOwnerPasswordClient.connection = new OAuth2RessourceOwnerPasswordClient(
      `${selectedPf.url}/auth/oauth2/token`,
      selectedPf.oauth.client_id,
      selectedPf.oauth.client_secret,
      createAppScopesLegacy(),
    );
    // === 4 - Dispatch the new selected platform in Redux Store
    dispatch({
      platformId,
      type: actionTypePlatformSelect,
    });
    // === 5 - Track event
    if (doTrack) Trackers.trackEvent('Connection', 'SELECT PLATFORM', selectedPf.url.replace(/(^\w+:|^)\/\//, ''));
    // === End
    if (redirect) navigate(getLoginRouteName(), { platformId });
  };
}

/**
 * Read and select the platform stored in AsyncStorage.
 */
export function loadCurrentPlatform() {
  return async (dispatch, getState) => {
    const platformId = await AsyncStorage.getItem(PLATFORM_STORAGE_KEY);
    if (platformId) {
      const currentPf = appConf.platforms.find(pf => pf.name === platformId);
      if (!currentPf) throw new Error(`Error: LOADED platform "${platformId}" doesn't exists.`);
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
    navigate('PlatformSelect');
  };
}
