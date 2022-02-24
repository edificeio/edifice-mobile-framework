import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, SafeAreaView, View } from 'react-native';
import { connect } from 'react-redux';

import { FakeHeader_Container, HeaderAction, HeaderCenter, HeaderLeft, FakeHeader_Row, HeaderTitle_Style } from '~/framework/components/header';
import { PFLogo } from '~/framework/components/pfLogo';
import { Text } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { FlatButton } from '~/ui';

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
        <FakeHeader_Container>
          <FakeHeader_Row>
            <HeaderLeft>
              <HeaderAction
                iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
                iconSize={24}
                onPress={() => navigation.goBack()}
              />
            </HeaderLeft>
            <HeaderCenter>
              <HeaderTitle_Style>{this.pfConf.displayName}</HeaderTitle_Style>
            </HeaderCenter>
          </FakeHeader_Row>
        </FakeHeader_Container>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
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
      </>
    );
  }
}

const ConnectedLoginWAYFPage = connect()(LoginWAYFPage);

export default withViewTracking('auth/loginWAYF')(ConnectedLoginWAYFPage);
