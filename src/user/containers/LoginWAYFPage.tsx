import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { Text } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { FlatButton } from '~/ui/FlatButton';

export interface ILoginWAYFPageProps {
  navigation?: any;
}

export interface ILoginWAYFPageState {}

export class LoginWAYFPage extends React.Component<ILoginWAYFPageProps, ILoginWAYFPageState> {
  private pfConf = DEPRECATED_getCurrentPlatform()!;

  constructor(props: ILoginWAYFPageProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { navigation } = this.props;
    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: this.pfConf.displayName,
        }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.ui.background.card }}>
          <View
            style={{ alignItems: 'center', flex: 1, justifyContent: 'space-around', paddingHorizontal: 32, paddingVertical: 96 }}>
            <PFLogo />
            <Text style={{ textAlign: 'center' }}>{I18n.t('login-wayf-main-text')}</Text>
            <FlatButton
              title={I18n.t('login-wayf-main-button')}
              onPress={() => {
                Trackers.trackEvent('Auth', 'WAYF', 'Display');
                navigation.navigate('WAYF');
              }}
            />
          </View>
        </SafeAreaView>
      </PageView>
    );
  }
}

const ConnectedLoginWAYFPage = connect()(LoginWAYFPage);

export default withViewTracking('auth/loginWAYF')(ConnectedLoginWAYFPage);
