import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { InteractionManager, SafeAreaView, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation';
import { IAuthState, getState as getAuthState } from '~/framework/modules/auth/reducer';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';

import { consumeAuthError } from '../actions';

interface ILoginWayfScreenStoreProps {
  auth: IAuthState;
}
interface LoginWayfScreenDispatchProps {
  handleConsumeError: (...args: Parameters<typeof consumeAuthError>) => Promise<void>;
}
interface ILoginWayfScreenProps
  extends NativeStackScreenProps<IAuthNavigationParams, AuthRouteNames.loginWayf>,
    ILoginWayfScreenStoreProps,
    LoginWayfScreenDispatchProps {}

export interface ILoginWayfScreenState {
  error: IAuthState['error'];
}

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
  textError: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
});

const initialState: ILoginWayfScreenState = {
  error: undefined,
};

export class LoginWAYFPage extends React.Component<ILoginWayfScreenProps, ILoginWayfScreenState> {
  private mounted = false;

  private unsubscribeBlur?: () => void;

  private unsubscribeBlurTask?: ReturnType<typeof InteractionManager.runAfterInteractions>;

  constructor(props: ILoginWayfScreenProps) {
    super(props);
    this.state = { ...initialState };
  }

  consumeError() {
    if (this.props.auth.error) {
      this.setState({ error: this.props.auth.error });
      this.props.handleConsumeError();
    }
  }

  resetError() {
    this.setState({ error: undefined });
  }

  componentDidMount() {
    this.mounted = true;
    this.consumeError();
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      this.unsubscribeBlurTask = InteractionManager.runAfterInteractions(() => {
        this.resetError();
      });
    });
  }

  componentDidUpdate() {
    this.consumeError();
  }

  componentWillUnmount(): void {
    this.mounted = false;
    this.unsubscribeBlur?.();
    this.unsubscribeBlurTask?.cancel();
  }

  public render() {
    const { navigation, route } = this.props;
    const { error } = this.state;
    const { platform } = route.params;
    return (
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            <PFLogo pf={route.params.platform} />
            <SmallText style={styles.textCenter}>{I18n.t('login-wayf-main-text')}</SmallText>
            <SmallText style={styles.textError}>
              {error
                ? I18n.t('auth-error-' + error, {
                    version: DeviceInfo.getVersion(),
                    errorcode: error,
                    currentplatform: platform.url,
                    defaultValue: I18n.t('auth-error-other', {
                      version: DeviceInfo.getVersion(),
                      errorcode: error,
                      currentplatform: platform.url,
                    }),
                  })
                : ''}
            </SmallText>
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

export default connect(
  (state: any, props: any): ILoginWayfScreenStoreProps => {
    const auth = getAuthState(state);
    return {
      auth,
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleConsumeError: tryActionLegacy(
          consumeAuthError,
          undefined,
          false,
        ) as unknown as LoginWayfScreenDispatchProps['handleConsumeError'],
      },
      dispatch,
    ),
)(LoginWAYFPage);
