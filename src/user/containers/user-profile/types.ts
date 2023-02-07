import { NavigationInjectedProps } from 'react-navigation';
import { Dispatch } from 'redux';

import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import { IUserSession } from '~/framework/util/session';
import { IUpdatableProfileValues } from '~/user/actions/profile';
import { IUserAuthState } from '~/user/reducers/auth';
import { IUserInfoState } from '~/user/state/info';

export interface IProfilePageDataProps {
  userauth: IUserAuthState;
  userinfo: IUserInfoState;
  session: IUserSession;
}

export interface IProfilePageEventProps {
  onSave: (updatedProfileValues: IUpdatableProfileValues) => void;
  dispatch: Dispatch;
}

export type IProfilePageProps = IProfilePageDataProps &
  IProfilePageEventProps &
  NavigationInjectedProps & {
    onUploadAvatar: (avatar: LocalFile) => Promise<SyncedFile>;
    onUpdateAvatar: (uploadedAvatarUrl: string) => Promise<void>;
    onPickFileError: (notifierId: string) => void;
    onUploadAvatarError: () => void;
  };

export type IProfilePageState = IUpdatableProfileValues & {
  emailValid?: boolean;
  homePhoneValid?: boolean;
  loginAliasValid?: boolean;
  updatingAvatar?: boolean;
};
