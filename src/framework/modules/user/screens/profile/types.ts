import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dispatch } from 'redux';

import { ISession } from '~/framework/modules/auth/model';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';
import { IUpdatableProfileValues } from '~/user/actions/profile';
import { IUserAuthState } from '~/user/reducers/auth';
import { IUserInfoState } from '~/user/state/info';

import { UserNavigationParams, userRouteNames } from '../../navigation';

export interface IProfilePageDataProps {
  userauth: IUserAuthState;
  userinfo: IUserInfoState;
  session: ISession;
}

export interface IProfilePageEventProps {
  onSave: (updatedProfileValues: IUpdatableProfileValues) => void;
  dispatch: Dispatch;
}

export type IProfilePageProps = IProfilePageDataProps &
  IProfilePageEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.profile> & {
    onUploadAvatar: (avatar: LocalFile) => Promise<SyncedFile>;
    onUpdateAvatar: (uploadedAvatarUrl: string) => Promise<void>;
    onPickFileError: (notifierId: string) => void;
    onUploadAvatarError: () => void;
  };

export type IProfilePageState = IUpdatableProfileValues & {
  homePhoneValid?: boolean;
  loginAliasValid?: boolean;
  updatingAvatar?: boolean;
};

export interface ProfileScreenNavigationParams {
  updatedProfileValues?: IUpdatableProfileValues;
  edit?: boolean;
  onCancel?: () => void;
  onSave?: (updatedProfileValues: IUpdatableProfileValues) => void;
}
