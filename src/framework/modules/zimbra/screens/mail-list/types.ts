import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { DefaultFolder, IFolder, IMail, IQuota } from '~/framework/modules/zimbra/model';
import type { ZimbraNavigationParams } from '~/framework/modules/zimbra/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ZimbraMailListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
  mails: Omit<IMail, 'body'>[];
  quota: IQuota;
  rootFolders: IFolder[];
  session?: ISession;
  fetchMailsFromFolder: (folder: string, page: number, search?: string) => Promise<Omit<IMail, 'body'>[]>;
}

export interface ZimbraMailListScreenNavParams {
  folderName: DefaultFolder | string;
  folderPath: string;
}

export interface ZimbraMailListScreenPrivateProps
  extends NativeStackScreenProps<ZimbraNavigationParams, 'mailList'>,
    ZimbraMailListScreenProps {
  // @scaffolder add HOC props here
}
