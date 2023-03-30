import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dispatch } from 'redux';

import { ISession } from '~/framework/modules/auth/model';
import { UpdatableProfileValues } from '~/framework/modules/user/actions';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';

import { UserNavigationParams, userRouteNames } from '../../navigation';

export interface IProfilePageDataProps {
  session?: ISession;
}

export interface IProfilePageEventProps {
  onSave: (updatedProfileValues: UpdatableProfileValues) => void;
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

export type IProfilePageState = UpdatableProfileValues & {
  homePhoneValid?: boolean;
  loginAliasValid?: boolean;
  updatingAvatar?: boolean;
};

export interface ProfileScreenNavigationParams {
  updatedProfileValues?: UpdatableProfileValues;
  edit?: boolean;
  onCancel?: () => void;
  onSave?: (updatedProfileValues: UpdatableProfileValues) => void;
}
