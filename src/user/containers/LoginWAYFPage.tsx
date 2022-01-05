import style from 'glamorous-native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, SafeAreaView, View } from 'react-native';
import { connect } from 'react-redux';

import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from '~/framework/components/header';
import { H1, Text } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { FlatButton } from '~/ui';

const Logo = style.image({ height: 75, width: 300, resizeMode: 'contain' });

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
      <>
        <FakeHeader>
          <HeaderRow>
            <HeaderLeft>
              <HeaderAction
                iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
                iconSize={24}
                onPress={() => navigation.goBack()}
              />
            </HeaderLeft>
            <HeaderCenter>
              <HeaderTitle>{this.pfConf.displayName}</HeaderTitle>
            </HeaderCenter>
          </HeaderRow>
        </FakeHeader>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View
            style={{ alignItems: 'center', flex: 1, justifyContent: 'space-around', paddingHorizontal: 32, paddingVertical: 96 }}>
            <Logo source={this.pfConf.logo} />
            <Text style={{ textAlign: 'center' }}>{I18n.t('login-wayf-text')}</Text>
            <FlatButton
              title={I18n.t('login-wayf-button')}
              onPress={() => {
                Trackers.trackEvent('Auth', 'WAYF', 'Display');
                navigation.navigate('WAYF');
              }}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const ConnectedLoginWAYFPage = connect()(LoginWAYFPage);

export default withViewTracking('auth/loginWAYF')(ConnectedLoginWAYFPage);
