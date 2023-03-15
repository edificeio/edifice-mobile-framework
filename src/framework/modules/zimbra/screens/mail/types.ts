import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { IFolder, IMail, IQuota } from '~/framework/modules/zimbra/model';
import type { ZimbraNavigationParams } from '~/framework/modules/zimbra/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ZimbraMailScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
  quota: IQuota;
  rootFolders: IFolder[];
  mail?: IMail;
  session?: ISession;
  fetchMail: (id: string) => Promise<IMail>;
  fetchQuota: () => Promise<IQuota>;
  fetchRootFolders: () => Promise<IFolder[]>;
}

export interface ZimbraMailScreenNavParams {
  folderPath: string;
  id: string;
  subject: string;
}

export interface ZimbraMailScreenPrivateProps
  extends NativeStackScreenProps<ZimbraNavigationParams, 'mail'>,
    ZimbraMailScreenProps {
  // @scaffolder add HOC props here
}
