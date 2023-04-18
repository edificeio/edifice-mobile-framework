import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { DraftType, IMail, ISignature } from '~/framework/modules/zimbra/model';
import type { ZimbraNavigationParams } from '~/framework/modules/zimbra/navigation';
import { AsyncState } from '~/framework/util/redux/async';

export interface ZimbraComposerScreenProps {
  hasRightToSendExternalMails: boolean;
  isFetching: boolean;
  mail: IMail;
  signature: AsyncState<ISignature>;
  session?: ISession;
  fetchMail: (id: string) => Promise<IMail>;
  fetchSignature: () => Promise<ISignature>;
  onPickFileError: (notifierId: string) => void;
}

export interface ZimbraComposerScreenNavParams {
  type: DraftType;
  isTrashed?: boolean;
  mailId?: string;
  refreshList?: () => void;
}

export interface ZimbraComposerScreenPrivateProps
  extends NativeStackScreenProps<ZimbraNavigationParams, 'composer'>,
    ZimbraComposerScreenProps {
  // @scaffolder add HOC props here
}
