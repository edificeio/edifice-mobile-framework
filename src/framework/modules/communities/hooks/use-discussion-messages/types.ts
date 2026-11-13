import type { DiscussionDto } from '@edifice.io/community-client-rest-rn';

import type { PaginatedFlashListProps, PaginatedListItem } from '~/framework/components/list/paginated-list';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { DiscussionMessage } from '~/framework/modules/communities/adapter';
import type { ScrollTarget } from '~/framework/modules/communities/hooks/use-scroll-and-stick-to-target';

export interface UseDiscussionMessages {
  consumeInitialTarget: () => ScrollTarget | undefined;
  firstUnreadIndex?: number;
  initialScrollIndex?: number;
  isLastPageLoaded: () => boolean;
  loadLastPage: () => Promise<void>;
  markMessageAsDeleted: (id: string) => void;
  messages: PaginatedListItem<DiscussionMessage>[];
  onPageReached: NonNullable<PaginatedFlashListProps<DiscussionMessage>['onPageReached']>;
  /** Loads again the page holding the message, if it's loaded */
  reloadMessagePage: (messageId: number) => Promise<void>;
}

export interface UseDiscussionMessagesParams {
  communityId: number;
  discussion?: DiscussionDto;
  discussionId: number;
  /** Called on each full reload of the messages, along with them */
  refreshDiscussion: (isInitialLoad: boolean) => Promise<void>;
  session: AuthActiveAccount;
}
