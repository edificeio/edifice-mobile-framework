import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type {
  fetchZimbraMailAction,
  fetchZimbraQuotaAction,
  fetchZimbraRootFoldersAction,
} from '~/framework/modules/zimbra/actions';
import type { IFolder, IMail, IQuota } from '~/framework/modules/zimbra/model';
import type { ZimbraNavigationParams, zimbraRouteNames } from '~/framework/modules/zimbra/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ZimbraMailScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface ZimbraMailScreenNavParams {
  folderPath: string;
  id: string;
  subject: string;
  onNavigateBack?: () => void;
}

export interface ZimbraMailScreenStoreProps {
  quota: IQuota;
  rootFolders: IFolder[];
  mail?: IMail;
  session?: ISession;
}

export interface ZimbraMailScreenDispatchProps {
  tryFetchMail: (...args: Parameters<typeof fetchZimbraMailAction>) => Promise<IMail>;
  tryFetchQuota: (...args: Parameters<typeof fetchZimbraQuotaAction>) => Promise<IQuota>;
  tryFetchRootFolders: (...args: Parameters<typeof fetchZimbraRootFoldersAction>) => Promise<IFolder[]>;
}

export type ZimbraMailScreenPrivateProps = ZimbraMailScreenProps &
  ZimbraMailScreenStoreProps &
  ZimbraMailScreenDispatchProps &
  NativeStackScreenProps<ZimbraNavigationParams, typeof zimbraRouteNames.mail>;
