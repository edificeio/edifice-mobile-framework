/**
 * Actions of the header of `MyAppsHomeScreen`. They are components, that read what they need (apps, onboarding) themselves; the filter
 * of the list comes from the params of the screen, through its options: no `setOptions` in an effect (§4 n° 12 of the migration sheet).
 */
import * as React from 'react';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackHeaderItemProps } from '@react-navigation/native-stack';

import { HeaderActionButton, headerCustom, headerRightActions } from '~/app/navigation-new';
import { useStorageJSON } from '~/framework/util/storage/hooks';
import { useHasAppsToList } from '~/modules/myapps/hooks';
import type { MyAppsFilter } from '~/modules/myapps/model';
import { isOnboardingSeen } from '~/modules/myapps/model/onboarding';
import { getSeenOnboardingVersion, storage } from '~/modules/myapps/storage';

/** Opens the onboarding again. Its icon tells whether the user went through the current one. */
const OnboardingAction = ({ tintColor }: NativeStackHeaderItemProps) => {
  const navigation = useNavigation();
  const hasApps = useHasAppsToList();
  const [onboarding] = useStorageJSON(storage, 'onboarding');
  const seen = isOnboardingSeen(getSeenOnboardingVersion(onboarding));
  return (
    <HeaderActionButton
      // ToDo(myapps-migration): `accessibilityLabel` once a translation exists for it
      disabled={!hasApps}
      icon={seen ? 'ui-notif-empty' : 'ui-notif'}
      onPress={() => navigation.navigate('myapps/onboarding')}
      testID={seen ? 'myapps-navbar-notif-empty' : 'myapps-navbar-notif'}
      tintColor={tintColor}
    />
  );
};

/** Opens the menu of the screen (favorites, browser, « show all the apps »): it depends on the filter of the list. */
const MenuAction = ({ filter, tintColor }: NativeStackHeaderItemProps & { filter: MyAppsFilter | undefined }) => {
  const navigation = useNavigation();
  const hasApps = useHasAppsToList();
  return (
    <HeaderActionButton
      // ToDo(myapps-migration): `accessibilityLabel` once a translation exists for it
      disabled={!hasApps}
      icon="ui-options"
      onPress={() => navigation.navigate('myapps/menu', { isFavoritesFilter: filter?.type === 'favorites' })}
      testID="myapps-navbar-context-menu"
      tintColor={tintColor}
    />
  );
};

/** The buttons of the header, for the options of the screen: from right to left, the menu at the edge (as the old screen). */
export const homeHeaderActions = (filter: MyAppsFilter | undefined) =>
  headerRightActions(
    headerCustom(props => <MenuAction {...props} filter={filter} />),
    headerCustom(props => <OnboardingAction {...props} />),
  );
