import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { fetchZimbraMailsFromFolderAction } from '~/framework/modules/zimbra/actions';
import type { DefaultFolder, IFolder, IMail, IQuota } from '~/framework/modules/zimbra/model';
import type { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ZimbraMailListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface ZimbraMailListScreenNavParams {
  folderName: DefaultFolder | string;
  folderPath: string;
}

export interface ZimbraMailListScreenStoreProps {
  mails: Omit<IMail, 'body'>[];
  quota: IQuota;
  rootFolders: IFolder[];
  session?: ISession;
}

export interface ZimbraMailListScreenDispatchProps {
  tryFetchMailsFromFolder: (...args: Parameters<typeof fetchZimbraMailsFromFolderAction>) => Promise<Omit<IMail, 'body'>[]>;
}

export type ZimbraMailListScreenPrivateProps = ZimbraMailListScreenProps &
  ZimbraMailListScreenStoreProps &
  ZimbraMailListScreenDispatchProps &
  NativeStackScreenProps<ZimbraNavigationParams, typeof zimbraRouteNames.mailList>;
