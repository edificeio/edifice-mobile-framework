import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import { IAuthState, getState as getAuthState } from '~/framework/modules/auth/reducer';
import { Trackers } from '~/framework/util/tracker';

interface ILoginWayfScreenReduxProps {
  auth: IAuthState;
}
interface ILoginWayfScreenProps
  extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.loginWayf>,
    ILoginWayfScreenReduxProps {}

export interface ILoginWayfScreenState {}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.ui.background.card },
  safeAreaInner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge * 1.5,
  },
  textCenter: { textAlign: 'center' },
});

export class LoginWAYFPage extends React.Component<ILoginWayfScreenProps, ILoginWayfScreenState> {
  constructor(props: ILoginWayfScreenProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { navigation, route } = this.props;
    const { error } = this.props.auth;
    return (
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            <PFLogo pf={route.params.platform} />
            <SmallText style={styles.textCenter}>{I18n.t('login-wayf-main-text')}</SmallText>
            <ActionButton
              text={I18n.t('login-wayf-main-button')}
              action={() => {
                Trackers.trackEvent('Auth', 'WAYF', 'Display');
                navigation.navigate(AuthRouteNames.wayf, { platform: route.params.platform });
              }}
            />
          </View>
        </SafeAreaView>
      </PageView>
    );
  }
}

export default connect((state: any, props: any): ILoginWayfScreenReduxProps => {
  const auth = getAuthState(state);
  return {
    auth,
  };
})(LoginWAYFPage);
