import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dispatch } from 'redux';

import { ISession } from '~/framework/modules/auth/model';
import { UpdatableProfileValues } from '~/framework/modules/user/actions';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { LocalFile, SyncedFile } from '~/framework/util/fileHandler';

export interface ProfilePageDataProps {
  session?: ISession;
}

export interface ProfilePageEventProps {
  dispatch: Dispatch;
}

export type ProfilePageProps = ProfilePageDataProps &
  ProfilePageEventProps &
  NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.profile> & {
    onUploadAvatar: (avatar: LocalFile) => Promise<SyncedFile>;
    onUpdateAvatar: (uploadedAvatarUrl: string) => Promise<void>;
    onPickFileError: (notifierId: string) => void;
    onUploadAvatarError: () => void;
  };

export interface ProfileScreenNavigationParams {
  userId?: string;
}
