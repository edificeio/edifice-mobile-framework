import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';

import { DiscussionStatus } from '~/framework/modules/communities/model';

export interface DiscussionStatusTabProps {
  status?: DiscussionStatus;
  type: DiscussionIcon;
}
