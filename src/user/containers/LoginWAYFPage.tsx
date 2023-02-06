import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/action-button';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

import { actionTypeLoginCancel } from '../actions/actionTypes/login';
import { IUserAuthState } from '../reducers/auth';
import { getAuthState } from '../selectors';

export interface ILoginWAYFPageProps {
  navigation?: any;
  auth: IUserAuthState;
  onCancel: () => void;
}

export interface ILoginWAYFPageState {}

export class LoginWAYFPage extends React.Component<ILoginWAYFPageProps, ILoginWAYFPageState> {
  private pfConf = DEPRECATED_getCurrentPlatform()!;

  constructor(props: ILoginWAYFPageProps) {
    super(props);
    this.state = {};
  }

  public componentWillUnmount(): void {
    this.props.onCancel();
  }

  public render() {
    const { navigation } = this.props;
    const { error, errtype } = this.props.auth;
    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: this.pfConf.displayName,
        }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.ui.background.card }}>
          <View
            style={{
              alignItems: 'center',
              flex: 1,
              justifyContent: 'space-around',
              paddingHorizontal: UI_SIZES.spacing.large,
              paddingVertical: UI_SIZES.spacing.huge * 1.5,
            }}>
            <PFLogo />
            <SmallText style={{ textAlign: 'center' }}>{I18n.t('login-wayf-main-text')}</SmallText>
            <SmallText
              style={{
                flexGrow: 0,
                marginTop: UI_SIZES.spacing.medium,
                padding: UI_SIZES.spacing.tiny,
                textAlign: 'center',
                alignSelf: 'center',
                color: errtype === 'warning' ? theme.palette.status.warning.regular : theme.palette.status.failure.regular,
              }}>
              {error &&
                I18n.t('auth-error-' + error, {
                  version: DeviceInfo.getVersion(),
                  errorcode: error,
                  currentplatform: DEPRECATED_getCurrentPlatform()!.url,
                })}
            </SmallText>
            <ActionButton
              text={I18n.t('login-wayf-main-button')}
              action={() => {
                Trackers.trackEvent('Auth', 'WAYF', 'Display');
                this.props.onCancel();
                navigation.navigate('WAYF');
              }}
            />
          </View>
        </SafeAreaView>
      </PageView>
    );
  }
}

const ConnectedLoginWAYFPage = connect(
  (state: any, props: any): Omit<ILoginWAYFPageProps, 'navigation' | 'onCancel'> => {
    const auth: IUserAuthState = getAuthState(state);
    return {
      auth,
    };
  },
  (dispatch): Omit<ILoginWAYFPageProps, 'navigation' | 'auth'> => ({
    onCancel: () => {
      dispatch<any>({ type: actionTypeLoginCancel });
    },
  }),
)(LoginWAYFPage);

export default withViewTracking('auth/loginWAYF')(ConnectedLoginWAYFPage);
