import { InvitationResponseDto } from '@edifice.io/community-client-rest-rn';

import moduleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import { LOADING_ITEM_DATA, staleOrSplice } from '~/framework/components/list/paginated-list';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export interface CommunitiesStore {
  allCommunities: (InvitationResponseDto | typeof LOADING_ITEM_DATA)[];
  pendingCommunities: (InvitationResponseDto | typeof LOADING_ITEM_DATA)[];
  communitiesDetails: Record<string, InvitationResponseDto>;
}

const communitiesActionTypes = {
  LOAD_ALL_COMMUNITIES_PAGE: moduleConfig.namespaceActionType('LOAD_ALL_COMMUNITIES_PAGE') as `${string}_LOAD_ALL_COMMUNITIES_PAGE`,
  LOAD_PENDING_COMMUNITIES_PAGE: moduleConfig.namespaceActionType(
    'LOAD_PENDING_COMMUNITIES_PAGE',
  ) as `${string}_LOAD_PENDING_COMMUNITIES_PAGE`,
};

export type CommunitiesAction = {
  type: typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE | typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE;
  payload: { newData: { items: InvitationResponseDto[]; from: number; total: number }; reloadAll?: boolean };
};

export const reducer = createSessionReducer<CommunitiesStore, CommunitiesAction>(
  { allCommunities: [], communitiesDetails: {}, pendingCommunities: [] },
  {
    [communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE]: (state, action) => {
      return {
        ...state,
        allCommunities: staleOrSplice(state.allCommunities, action.payload.newData, action.payload.reloadAll),
      };
    },
    [communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE]: (state, action) => {
      return {
        ...state,
        pendingCommunities: staleOrSplice(state.pendingCommunities, action.payload.newData, action.payload.reloadAll),
      };
    },
  },
);

export const communitiesActions = {
  loadAllCommunitiesPage: (newData: { items: InvitationResponseDto[]; from: number; total: number }, reloadAll = false) => ({
    payload: { newData, reloadAll },
    type: communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE,
  }),
  loadPendingCommunitiesPage: (newData: { items: InvitationResponseDto[]; from: number; total: number }, reloadAll = false) => ({
    payload: { newData, reloadAll },
    type: communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE,
  }),
};

export const communitiesSelectors = {
  getAllCommunities: (state: IGlobalState) => moduleConfig.getState(state).allCommunities,
  getPendingCommunities: (state: IGlobalState) => moduleConfig.getState(state).pendingCommunities,
};
