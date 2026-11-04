import * as React from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { useStorageJSON } from '~/framework/util/storage/hooks';
import { useHasAppsToList } from '~/modules/myapps/hooks';
import { shouldShowOnboarding } from '~/modules/myapps/model/onboarding';
import { getSeenOnboardingVersion, storage } from '~/modules/myapps/storage';
import { myAppsActions, selectOnboardingShown } from '~/modules/myapps/store';

/**
 * Opens the onboarding when the screen gets the focus, if the user didn't go through its current version and it was not shown
 * automatically during this session yet (§4 n° 4-5 of the migration sheet). Not when there is no app to show.
 */
export const useAutoOnboarding = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const hasApps = useHasAppsToList();
  const shownThisSession = useSelector(selectOnboardingShown);
  const [onboarding] = useStorageJSON(storage, 'onboarding');
  const seenVersion = getSeenOnboardingVersion(onboarding);

  useFocusEffect(
    React.useCallback(() => {
      if (!hasApps || !shouldShowOnboarding(seenVersion, shownThisSession)) return;
      dispatch(myAppsActions.onboardingShown());
      navigation.navigate('myapps/onboarding');
    }, [dispatch, hasApps, navigation, seenVersion, shownThisSession]),
  );
};
