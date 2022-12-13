import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { Text } from '~/framework/components/text';
import { Trackers } from '~/framework/util/tracker';
import { FlatButton } from '~/ui/FlatButton';

import { AuthRouteNames, IAuthNavigationParams } from '../navigation';

interface ILoginWayfScreenProps extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.loginWayf> {}

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
    return (
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            <PFLogo pf={route.params.platform} />
            <Text style={styles.textCenter}>{I18n.t('login-wayf-main-text')}</Text>
            <FlatButton
              title={I18n.t('login-wayf-main-button')}
              onPress={() => {
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

export default connect()(LoginWAYFPage);
