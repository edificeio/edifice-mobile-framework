import { IVersionContext } from '~/user/actions/version';
import { IUserAuthState } from '~/user/reducers/auth';

export interface ILoginPageDataProps {
  auth: IUserAuthState;
  headerHeight: number;
  // version
  versionContext: IVersionContext | null;
  versionModal: boolean;
  version: string;
  versionMandatory: boolean;
  // connection
  connected: boolean;
}

export interface ILoginPageEventProps {
  onSkipVersion(versionContext: IVersionContext): void;
  onUpdateVersion(versionContext: IVersionContext): void;
  onLogin(userlogin: string, password: string, rememberMe: boolean): void;
}

export interface ILoginPageOtherProps {
  navigation?: any;
}

export type ILoginPageProps = ILoginPageDataProps & ILoginPageEventProps & ILoginPageOtherProps;

export interface ILoginPageState {
  login?: string;
  password?: string;
  typing: boolean;
  rememberMe: boolean;
  isLoggingIn: boolean;
}
