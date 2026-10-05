import * as React from 'react';

import { CommunityType, InvitationStatus } from '@edifice.io/community-client-rest-rn';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { getInvitations, getPendingInvitationsCount } from '~/framework/modules/communities/service/invitations';
import {
  CommunitiesAction,
  communitiesActions,
  communitiesActionTypes,
  communitiesSelectors,
} from '~/framework/modules/communities/store';

/**
 * Loads the communities list (all + pending invitations) into redux, and reloads it on filters change and on screen focus.
 */
export default function useCommunitiesList({
  filters,
  pageSize,
  session,
}: {
  filters: CommunityType[];
  pageSize: number;
  session: AuthActiveAccount;
}) {
  const pendingCommunities = useSelector(communitiesSelectors.getPendingCommunities);
  const dispatch =
    useDispatch<
      ThunkDispatch<
        IGlobalState,
        any,
        | CommunitiesAction<typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE>
        | CommunitiesAction<typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE>
      >
    >();

  const [totalPendingInvitations, setTotalPendingInvitations] = React.useState<number>(pendingCommunities.length);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      const communityType = filters.length === 1 ? filters[0] : undefined;

      const [allRes, pendingRes, totalPending] = await Promise.all([
        getInvitations(session, page, pageSize, { communityType }),
        getInvitations(session, page, pageSize, { communityType, status: InvitationStatus.PENDING }),
        getPendingInvitationsCount(session),
      ]);

      dispatch(communitiesActions.loadAllCommunitiesPage({ from: page * pageSize, ...allRes }, reloadAll));
      dispatch(communitiesActions.loadPendingCommunitiesPage({ from: page * pageSize, ...pendingRes }, reloadAll));

      setTotalPendingInvitations(totalPending);
      setIsLoading(false);
    },
    [dispatch, filters, pageSize, session],
  );

  // Skip the effect on first mount, already handled by ContentLoader
  const isFirstFiltersRunRef = React.useRef(true);

  // Reload data on filters change
  React.useEffect(() => {
    if (isFirstFiltersRunRef.current) {
      isFirstFiltersRunRef.current = false;
      return;
    }
    loadData(0, true).catch(e => console.error('Error while reloading communities list', e));
  }, [loadData]);

  // loadData is read through a ref: the focus effect keeps empty deps so it doesn't re-run on
  // every filters change, and the ref keeps it from calling a stale loadData (old filters).
  const loadDataRef = React.useRef(loadData);
  loadDataRef.current = loadData;

  // Skip the first focus, already handled by ContentLoader
  const isFirstFocusRef = React.useRef(true);

  // Reload the list when coming back to this screen
  useFocusEffect(
    React.useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      loadDataRef.current(0, true).catch(e => console.error('Error while refreshing communities list', e));
    }, []),
  );

  return { isLoading, loadData, totalPendingInvitations };
}
