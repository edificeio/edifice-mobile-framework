import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { consumeAuthErrorAction } from '~/framework/modules/auth/actions';
import { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { IAuthState, getState as getAuthState } from '~/framework/modules/auth/reducer';
import { Error } from '~/framework/util/error';
import { handleAction } from '~/framework/util/redux/actions';
import { Trackers } from '~/framework/util/tracker';

interface ILoginWayfScreenStoreProps {
  auth: IAuthState;
  error: IAuthState['error'];
}
interface LoginWayfScreenDispatchProps {
  handleConsumeError: (...args: Parameters<typeof consumeAuthErrorAction>) => void;
}
interface ILoginWayfScreenProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.loginWayf>,
    ILoginWayfScreenStoreProps,
    LoginWayfScreenDispatchProps {}

export interface ILoginWayfScreenState {
  errkey: number;
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
export class LoginWAYFPage extends React.Component<ILoginWayfScreenProps, ILoginWayfScreenState> {
  private mounted = false;

  constructor(props: ILoginWayfScreenProps) {
    super(props);
    this.state = { errkey: Error.generateErrorKey() };
  }

  consumeError() {
    if (this.props.auth.error && this.props.auth.error.key === undefined) {
      this.props.handleConsumeError(this.state.errkey);
    }
  }

  resetError() {
    this.setState({ errkey: Error.generateErrorKey() });
  }

  componentDidMount() {
    this.mounted = true;
    this.consumeError();
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  public render() {
    const { navigation, route, error } = this.props;
    return (
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            <PFLogo pf={route.params.platform} />
            <SmallText style={styles.textCenter}>{I18n.get('auth-wayf-main-text')}</SmallText>
            <SmallText style={styles.textError}>
              {error
                ? error.key === undefined || error.key === this.state.errkey
                  ? Error.getAuthErrorText<Error.ErrorTypes<typeof Error.LoginError>>(Error.getDeepErrorType(error))
                  : ''
                : ''}
            </SmallText>
            <PrimaryButton
              text={I18n.get('auth-wayf-main-button')}
              action={() => {
                Trackers.trackEvent('Auth', 'WAYF', 'Display');
                navigation.navigate(authRouteNames.wayf, { platform: route.params.platform });
              }}
              testID="onboarding-login"
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
      error: auth.error,
    };
  },
  dispatch =>
    bindActionCreators<LoginWayfScreenDispatchProps>(
      {
        handleConsumeError: handleAction(consumeAuthErrorAction),
      },
      dispatch,
    ),
)(LoginWAYFPage);
