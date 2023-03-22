import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import { logoutAction } from '~/framework/modules/auth/actions';
import { getSession } from '~/framework/modules/auth/reducer';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { tryAction } from '~/framework/util/redux/actions';

import moduleConfig from '../../module-config';
import { UserNavigationParams, userRouteNames } from '../../navigation';
import styles from './styles';
import type { UserHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('MyAccount'),
});

function useLogoutFeature(handleLogout: UserHomeScreenPrivateProps['handleLogout']) {
  /**
   * Displays an Alert to the user that allows logging out
   * Caution: Alert callbacks eats any exception thrown silently.
   */
  const doLogout = React.useCallback(() => {
    Alert.alert('', I18n.t('auth-disconnectConfirm'), [
      {
        text: I18n.t('common.cancel'),
        style: 'default',
      },
      {
        text: I18n.t('directory-disconnectButton'),
        style: 'destructive',
        onPress: () => handleLogout(),
      },
    ]);
  }, [handleLogout]);

  /**
   * renders the logout button
   */
  const logoutButton = React.useMemo(() => {
    return (
      <SmallBoldText style={styles.logoutButton} onPress={() => doLogout()}>
        {I18n.t('directory-disconnectButton')}
      </SmallBoldText>
    );
  }, [doLogout]);

  return logoutButton;
}

function UserHomeScreen(props: UserHomeScreenPrivateProps) {
  const { handleLogout } = props;
  /**
   * When true, version number display more info about build / platform / override / etc
   */
  const [isVersionDetailsShown, setIsVersionDetailsShown] = React.useState<boolean>(false);

  const logoutButton = useLogoutFeature(handleLogout);

  return (
    <PageView>
      <View style={styles.sectionBottom}>{logoutButton}</View>
    </PageView>
  );
}

export default connect(
  (state: IGlobalState) => {
    return {
      session: getSession(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleLogout: tryAction(logoutAction) as unknown as UserHomeScreenPrivateProps['handleLogout'],
      },
      dispatch,
    ),
)(UserHomeScreen);
