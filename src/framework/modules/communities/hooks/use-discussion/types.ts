import type { DiscussionDto } from '@edifice.io/community-client-rest-rn';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface UseDiscussion {
  discussion?: DiscussionDto;
  fetchDiscussion: () => Promise<void>;
  /** Fetches the discussion again when its messages are reloaded, except on the first load if it has just been fetched */
  refreshDiscussion: (isInitialLoad: boolean) => Promise<void>;
}

export interface UseDiscussionParams {
  communityId: number;
  discussionId: number;
  onLoadError: (error: unknown) => void;
  session: AuthActiveAccount;
}
