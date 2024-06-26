import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { fetchZimbraMailsFromFolderAction } from '~/framework/modules/zimbra/actions';
import type { IFolder, IMail, IQuota, SystemFolder } from '~/framework/modules/zimbra/model';
import type { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ZimbraMailListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface ZimbraMailListScreenNavParams {
  folderName: SystemFolder | string;
  folderPath: string;
}

export interface ZimbraMailListScreenStoreProps {
  mails: Omit<IMail, 'body'>[];
  quota: IQuota;
  rootFolders: IFolder[];
  session?: AuthLoggedAccount;
}

export interface ZimbraMailListScreenDispatchProps {
  tryFetchMailsFromFolder: (...args: Parameters<typeof fetchZimbraMailsFromFolderAction>) => Promise<Omit<IMail, 'body'>[]>;
}

export type ZimbraMailListScreenPrivateProps = ZimbraMailListScreenProps &
  ZimbraMailListScreenStoreProps &
  ZimbraMailListScreenDispatchProps &
  NativeStackScreenProps<ZimbraNavigationParams, typeof zimbraRouteNames.mailList>;
