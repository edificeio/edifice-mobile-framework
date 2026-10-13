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
  /** The user submits the new password. The result is ignored. Throws if it fails (the template shows the error). */
  onSubmit: (payload: IChangePasswordFormData) => Promise<unknown>;
}

export interface AuthChangePasswordScreenProps extends AuthChangePasswordScreenStoreProps, AuthChangePasswordScreenDispatchProps {
  platform: Platform['name'];
  prefill?: string;
  prefillType: 'login' | 'password';
  prefillLock?: boolean;
  /** Shown above the form, in a slot with its own spacing: give it unstyled. */
  FormHeaderComponent?: React.ComponentType | React.ReactElement;
  /** Shown under the form, centered, in a slot with its own spacing: give it unstyled. */
  FormFooterComponent?: React.ComponentType | React.ReactElement;
}

export interface AuthChangePasswordScreenState extends IChangePasswordModel {
  typing: boolean;
  submitState: 'IDLE' | 'RUNNING' | 'DONE';
  error?: string;
}
