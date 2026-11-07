/**
 * Actions of the header of `MyAppsHomeScreen`. They are components, that read what they need (apps, onboarding) themselves: the
 * options of the screen stay static (no `setOptions` in an effect, §4 n° 12 of the migration sheet).
 */
import * as React from 'react';

import type { NativeStackHeaderItemCustom, NativeStackHeaderItemProps } from '@react-navigation/native-stack';

import { headerAction } from '~/app/navigation/util';
import { useStorageJSON } from '~/framework/util/storage/hooks';
import { useHasAppsToList } from '~/modules/myapps/hooks';
import { isOnboardingSeen } from '~/modules/myapps/model/onboarding';
import { getSeenOnboardingVersion, storage } from '~/modules/myapps/storage';

/** Opens the onboarding again. Its icon tells whether the user went through the current one. */
const OnboardingAction = (props: NativeStackHeaderItemProps) => {
  const hasApps = useHasAppsToList();
  const [onboarding] = useStorageJSON(storage, 'onboarding');
  const seen = isOnboardingSeen(getSeenOnboardingVersion(onboarding));
  return headerAction(
    {
      disabled: !hasApps,
      icon: seen ? 'ui-notif-empty' : 'ui-notif',
      // ToDo(myapps-migration): phase 5, open `myapps/onboarding`
      onPress: undefined,
      testID: seen ? 'myapps-navbar-notif-empty' : 'myapps-navbar-notif',
    },
    props,
  ).element;
};

/** Opens the menu of the screen (favorites, browser, « show all the apps »). */
const MenuAction = (props: NativeStackHeaderItemProps) => {
  const hasApps = useHasAppsToList();
  return headerAction(
    {
      disabled: !hasApps,
      icon: 'ui-options',
      // ToDo(myapps-migration): phase 5, open `myapps/menu`
      onPress: undefined,
      testID: 'myapps-navbar-context-menu',
    },
    props,
  ).element;
};

export const headerRight = (props: NativeStackHeaderItemProps) => (
  <>
    <OnboardingAction {...props} />
    <MenuAction {...props} />
  </>
);

export const headerRightItems = (props: NativeStackHeaderItemProps): NativeStackHeaderItemCustom[] => [
  { element: <OnboardingAction {...props} />, type: 'custom' },
  { element: <MenuAction {...props} />, type: 'custom' },
];
