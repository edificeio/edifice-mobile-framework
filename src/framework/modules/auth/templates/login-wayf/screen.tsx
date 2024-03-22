import * as React from 'react';
import { SafeAreaView, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { SmallText } from '~/framework/components/text';
import { consumeAuthErrorAction } from '~/framework/modules/auth/actions';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { Error } from '~/framework/util/error';
import { handleAction } from '~/framework/util/redux/actions';

import styles from './styles';
import {
  LoginWayfScreenDispatchProps,
  LoginWayfScreenPrivateProps,
  LoginWayfScreenState,
  LoginWayfScreenStoreProps,
} from './types';

export class LoginWAYFPage extends React.Component<LoginWayfScreenPrivateProps, LoginWayfScreenState> {
  private mounted = false;

  constructor(props: LoginWayfScreenPrivateProps) {
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
    const { navigation, route, error, wayfRoute } = this.props;
    return (
      <PageView>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            <PFLogo pf={route.params.platform} />
            <SmallText style={styles.textCenter}>{I18n.get('auth-wayf-main-text')}</SmallText>
            <SmallText style={styles.textError}>
              {error
                ? error.key === undefined || error.key === this.state.errkey
                  ? Error.getAuthErrorText<Error.ErrorTypes<typeof Error.LoginError>>(
                      Error.getDeepErrorType(error),
                      route.params.platform.url,
                    )
                  : ''
                : ''}
            </SmallText>
            <PrimaryButton
              text={I18n.get('auth-wayf-main-button')}
              action={() => navigation.dispatch(wayfRoute)}
              testID="onboarding-login"
            />
          </View>
        </SafeAreaView>
      </PageView>
    );
  }
}

export default connect(
  (state: any, props: any): LoginWayfScreenStoreProps => {
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
