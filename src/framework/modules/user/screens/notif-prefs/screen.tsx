import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserNotifPrefsScreenDispatchProps, UserNotifPrefsScreenPrivateProps, UserNotifPrefsScreenState } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.notifPrefs>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.get('user-notifPrefs-title'),
});

function UserNotifPrefsScreen(props: UserNotifPrefsScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>user notifPrefs screen</BodyBoldText>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {
      // @scaffolder add storeProps here.
    };
  },
  dispatch =>
    bindActionCreators(
      {
        // @scaffolder add dispatchProps here. Name must start with 'handle'.
      },
      dispatch,
    ),
)(UserNotifPrefsScreen);
