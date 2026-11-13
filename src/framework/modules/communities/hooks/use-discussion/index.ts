import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { getDiscussion } from '~/framework/modules/communities/service/discussions';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';

import { UseDiscussion, UseDiscussionParams } from './types';

/** Discussion from the store, fetched when it's missing (e.g. when opened from a notification) */
export function useDiscussion({ communityId, discussionId, onLoadError, session }: UseDiscussionParams): UseDiscussion {
  const dispatch = useDispatch();
  const discussion = useSelector(communitiesSelectors.getCommunityDiscussion(communityId, discussionId));

  const fetchDiscussion = React.useCallback(async () => {
    const loaded = await getDiscussion(session, communityId, discussionId);
    dispatch(communitiesActions.loadCommunityDiscussions(communityId, { [loaded.id]: loaded }));
  }, [communityId, discussionId, dispatch, session]);

  const wasDiscussionMissingRef = React.useRef(!discussion);
  const hasDiscussion = !!discussion;
  React.useEffect(() => {
    if (hasDiscussion) return;
    let cancelled = false;
    fetchDiscussion().catch(e => {
      if (!cancelled) onLoadError(e);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchDiscussion, hasDiscussion, onLoadError]);

  const refreshDiscussion = React.useCallback(
    async (isInitialLoad: boolean) => {
      if (!isInitialLoad || !wasDiscussionMissingRef.current) await fetchDiscussion();
    },
    [fetchDiscussion],
  );

  return { discussion, fetchDiscussion, refreshDiscussion };
}
