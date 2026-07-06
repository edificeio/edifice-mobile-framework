import type { IChangePasswordFormData, PlatformAuthContext } from '~/framework/modules/auth/model';
import type { IChangePasswordModel } from '~/framework/modules/auth/thunks';
import { HostId } from '~/framework/util/appConf';

export type IFields = 'oldPassword' | 'newPassword' | 'confirm';

// export interface ChangePasswordScreenNavParams {
//   forceChange?: boolean;
//   navCallback?: NavigationAction;
//   useResetCode?: boolean;
//   platform?: Platform;
//   credentials?: AuthCredentials | AuthUsernameCredential;
//   replaceAccountId?: keyof AuthState['accounts'];
//   replaceAccountTimestamp?: number;
// }

export interface AuthChangePasswordScreenStoreProps {
  context: PlatformAuthContext;
}

export interface AuthChangePasswordScreenDispatchProps {
  onSubmit: (payload: IChangePasswordFormData) => Promise<void>;
}

export interface AuthChangePasswordScreenProps extends AuthChangePasswordScreenStoreProps, AuthChangePasswordScreenDispatchProps {
  host: HostId;
  prefill?: string;
  prefillType: 'login' | 'password';
  prefillLock?: boolean;
  FormHeaderComponent?: React.ComponentType | React.ReactElement;
  FormFooterComponent?: React.ComponentType | React.ReactElement;
}

export interface AuthChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
}
