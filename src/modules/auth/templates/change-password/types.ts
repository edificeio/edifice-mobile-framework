import type { Platform } from '~/framework/util/appConf';
import type { IChangePasswordFormData, PlatformAuthContext } from '~/modules/auth/model';

export type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface IChangePasswordModel {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export interface AuthChangePasswordScreenStoreProps {
  context: PlatformAuthContext;
}

export interface AuthChangePasswordScreenDispatchProps {
  onSubmit: (payload: IChangePasswordFormData) => Promise<void>;
}

export interface AuthChangePasswordScreenProps extends AuthChangePasswordScreenStoreProps, AuthChangePasswordScreenDispatchProps {
  platform: Platform['name'];
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
