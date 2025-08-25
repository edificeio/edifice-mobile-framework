import { CommunityResponseDto, InvitationResponseDto } from '@edifice.io/community-client-rest-rn';

import moduleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import { LOADING_ITEM_DATA, staleOrSplice } from '~/framework/components/list/paginated-list';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export interface CommunitiesStore {
  allCommunities: (InvitationResponseDto | typeof LOADING_ITEM_DATA)[];
  pendingCommunities: (InvitationResponseDto | typeof LOADING_ITEM_DATA)[];
  communitiesDetails: Record<number, Pick<CommunityResponseDto, 'title' | 'image'> & { totalMembers: number; membersId: string[] }>;
}

const communitiesActionTypes = {
  LOAD_ALL_COMMUNITIES_PAGE: moduleConfig.namespaceActionType('LOAD_ALL_COMMUNITIES_PAGE') as `${string}_LOAD_ALL_COMMUNITIES_PAGE`,
  LOAD_COMMUNITY_DETAILS: moduleConfig.namespaceActionType('LOAD_COMMUNITY_DETAILS') as `${string}_LOAD_COMMUNITY_DETAILS`,
  LOAD_PENDING_COMMUNITIES_PAGE: moduleConfig.namespaceActionType(
    'LOAD_PENDING_COMMUNITIES_PAGE',
  ) as `${string}_LOAD_PENDING_COMMUNITIES_PAGE`,
};

export type CommunitiesAction<T> = T extends
  | typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE
  | typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE
  ? {
      type: typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE | typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE;
      payload: { newData: { items: InvitationResponseDto[]; from: number; total: number }; reloadAll?: boolean };
    }
  : {
      type: typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS;
      payload: { id: number; data: CommunitiesStore['communitiesDetails'][any] };
    };

export const reducer = createSessionReducer<
  CommunitiesStore,
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE>
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE>
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS>
>(
  { allCommunities: [], communitiesDetails: {}, pendingCommunities: [] },
  {
    [communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE>;
      return {
        ...state,
        allCommunities: staleOrSplice(state.allCommunities, action.payload.newData, action.payload.reloadAll),
      };
    },
    [communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE>;
      return {
        ...state,
        pendingCommunities: staleOrSplice(state.pendingCommunities, action.payload.newData, action.payload.reloadAll),
      };
    },
    [communitiesActionTypes.LOAD_COMMUNITY_DETAILS]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS>;
      return { ...state, communitiesDetails: { ...state.communitiesDetails, [action.payload.id]: action.payload.data } };
    },
  },
);

export const communitiesActions = {
  loadAllCommunitiesPage: (newData: { items: InvitationResponseDto[]; from: number; total: number }, reloadAll = false) => ({
    payload: { newData, reloadAll },
    type: communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE,
  }),
  loadCommunityDetails: (id: keyof CommunitiesStore['communitiesDetails'], data: CommunitiesStore['communitiesDetails'][any]) => ({
    payload: { data, id },
    type: communitiesActionTypes.LOAD_COMMUNITY_DETAILS,
  }),
  loadPendingCommunitiesPage: (newData: { items: InvitationResponseDto[]; from: number; total: number }, reloadAll = false) => ({
    payload: { newData, reloadAll },
    type: communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE,
  }),
};

export const communitiesSelectors = {
  getAllCommunities: (state: IGlobalState) => moduleConfig.getState(state).allCommunities,
  getCommunityDetails: (id: keyof CommunitiesStore['communitiesDetails']) => (state: IGlobalState) =>
    moduleConfig.getState(state).communitiesDetails[id],
  getPendingCommunities: (state: IGlobalState) => moduleConfig.getState(state).pendingCommunities,
};
