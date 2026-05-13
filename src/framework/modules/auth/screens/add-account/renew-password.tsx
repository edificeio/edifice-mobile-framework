import * as React from 'react';

import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { screenOptions } from '~/app/navigation/util';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import {
  AuthChangePasswordScreenDispatchProps,
  AuthChangePasswordScreenProps,
  AuthChangePasswordScreenStoreProps,
} from '~/framework/modules/auth/templates/change-password/types';
import { changePasswordActionAddAnotherAccount } from '~/framework/modules/auth/thunks';
import appConf from '~/framework/util/appConf';

export const AuthRenewPasswordScreenOptions = screenOptions(() => ({
  title: I18n.get('user-page-editpassword'),
}));

interface AuthRenewPasswordScreenProps
  extends
    Omit<
      AuthChangePasswordScreenProps,
      | 'onSubmit'
      | 'host'
      | 'prefill'
      | 'prefillType'
      | 'prefillLock'
      | keyof AuthChangePasswordScreenStoreProps
      | keyof AuthChangePasswordScreenDispatchProps
    >,
    ModuleScreenProps<'auth/renew-password'> {}

export function AuthRenewPasswordScreen({
  route: {
    params: { credentials, host },
  },
}: AuthRenewPasswordScreenProps) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const onSubmit: AuthChangePasswordScreenProps['onSubmit'] = React.useCallback(
    async payload => {
      return dispatch(
        changePasswordActionAddAnotherAccount(
          appConf.getHost(host),
          {
            confirm: payload.confirm,
            login: credentials.username,
            newPassword: payload.newPassword,
            resetCode: credentials.password,
          },
          false,
          true,
        ),
      );
    },
    [credentials.password, credentials.username, dispatch, host],
  );
  return <ChangePasswordScreen onSubmit={onSubmit} host={host} prefill={credentials.username} prefillType="login" prefillLock />;
}

// export const computeNavBar = ({
//   navigation,
//   route,
// }: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountChangePassword>): NativeStackNavigationOptions => ({
//   ...navBarOptions({
//     navigation,
//     route,
//     title: I18n.get('user-page-editpassword'),
//   }),
// });

// export default connect(
//   (state, props: AuthChangePasswordScreenPrivateProps) => {
//     return {
//       context: props.route.params.platform ? getPlatformContextOf(props.route.params.platform) : getPlatformContext(),
//       session: undefined,
//     };
//   },
//   (dispatch: ThunkDispatch<any, any, any>, props: AuthChangePasswordScreenOwnProps) => {
//     return bindActionCreators<AuthChangePasswordScreenDispatchProps>(
//       {
//         tryLogout: tryAction(logoutAction),
//         trySubmit: tryAction(
//           changePasswordActionAddAnotherAccount,
//           props.route.params.useResetCode ? { track: track.passwordRenew } : undefined,
//         ),
//       },
//       dispatch,
//     );
//   },
// )(function AuthChangePasswordScreen(props: AuthChangePasswordScreenPrivateProps) {
//   return <ChangePasswordScreen {...props} />;
// });
