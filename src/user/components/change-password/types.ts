import { NavigationInjectedProps } from 'react-navigation';
import { Dispatch } from 'redux';

import { IUserSession } from '~/framework/util/session';
import { IChangePasswordModel, IChangePasswordUserInfo } from '~/user/actions/changePassword';
import { ContextState, SubmitState } from '~/utils/SubmitState';

export type IFields = 'oldPassword' | 'newPassword' | 'confirm';

export interface IChangePasswordPageState extends IChangePasswordModel {
  typing: boolean;
  showExternalError: boolean;
}

export interface IChangePasswordPageDataProps extends IChangePasswordModel {
  passwordRegex: string;
  passwordRegexI18n: { [lang: string]: string };
  externalError: string;
  contextState: ContextState;
  submitState: SubmitState;
  session: IUserSession;
}
export interface IChangePasswordPageEventProps {
  onSubmit(model: IChangePasswordModel, redirectCallback?: (dispatch) => void, forceChange?: boolean): Promise<void>;
  onRetryLoad: (arg: IChangePasswordUserInfo) => void;
  dispatch: Dispatch;
}
export type IChangePasswordPageProps = IChangePasswordPageDataProps &
  IChangePasswordPageEventProps &
  NavigationInjectedProps<{
    redirectCallback: (dispatch) => void;
    forceChange?: boolean;
    isLoginNavigator?: boolean;
  }>;
