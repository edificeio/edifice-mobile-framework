import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';
import type { SharedValue } from 'react-native-reanimated';

import { AccountType } from '~/framework/modules/auth/model';
import { DiscussionStatus } from '~/framework/modules/communities/model';

export interface DiscussionHeaderCollapse {
  bandHeight: SharedValue<number>;
  collapsibleHeight: SharedValue<number>;
  onLayoutChange: (bandHeight: number, collapsibleHeight: number) => void;
  progress: SharedValue<number>;
}

export interface DiscussionHeaderProps {
  authorName: string;
  authorProfile: AccountType;
  collapse: DiscussionHeaderCollapse;
  createdAt?: Temporal.Instant;
  status?: DiscussionStatus;
  title: string;
  type: DiscussionIcon;
}
