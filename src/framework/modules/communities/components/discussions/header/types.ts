import { StyleProp, ViewStyle } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { AccountType } from '~/framework/modules/auth/model';
import { DiscussionStatus } from '~/framework/modules/communities/utils';

export interface DiscussionHeaderProps {
  authorName: string;
  authorProfile: AccountType;
  createdAt?: Temporal.Instant;
  status?: DiscussionStatus;
  title: string;
  type: DiscussionIcon;
}

export interface DiscussionStatusTabProps {
  status?: DiscussionStatus;
  style?: StyleProp<ViewStyle>;
}
