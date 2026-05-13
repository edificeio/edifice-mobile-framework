import { InvitationResponseDto } from '@edifice.io/community-client-rest-rn';
import {
  CommunityResponseDtoWithThumbnails,
  InvitationResponseDtoWithThumbnails,
} from '@edifice.io/community-client-rest-rn/utils';

import moduleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import { FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { LOADING_ITEM_DATA, staleOrSplice } from '~/framework/components/list/paginated-list';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export interface CommunitiesStore {
  allCommunities: (InvitationResponseDtoWithThumbnails | typeof LOADING_ITEM_DATA)[];
  pendingCommunities: (InvitationResponseDtoWithThumbnails | typeof LOADING_ITEM_DATA)[];
  communitiesDetails: Record<
    number,
    Pick<CommunityResponseDtoWithThumbnails, 'title' | 'image' | 'mobileThumbnails'> & {
      courseEntId?: string;
      totalMembers: number;
      membersId: string[];
    }
  >;
  communitiesFoldersMeta: Record<number, Record<number, Pick<FolderItem, 'title'>>>;
}

export const communitiesActionTypes = {
  LOAD_ALL_COMMUNITIES_PAGE: moduleConfig.namespaceActionType('LOAD_ALL_COMMUNITIES_PAGE') as `${string}_LOAD_ALL_COMMUNITIES_PAGE`,
  LOAD_COMMUNITY_DETAILS: moduleConfig.namespaceActionType('LOAD_COMMUNITY_DETAILS') as `${string}_LOAD_COMMUNITY_DETAILS`,
  LOAD_COMMUNITY_FOLDERS: moduleConfig.namespaceActionType('LOAD_COMMUNITY_FOLDERS') as `${string}_LOAD_COMMUNITY_FOLDERS`,
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
  : T extends typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS
    ? {
        type: typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS;
        payload: { id: number; data: CommunitiesStore['communitiesDetails'][any] };
      }
    : {
        type: typeof communitiesActionTypes.LOAD_COMMUNITY_FOLDERS;
        payload: { communityId: number; data: CommunitiesStore['communitiesFoldersMeta'][any] };
      };

export const reducer = createSessionReducer<
  CommunitiesStore,
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE>
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE>
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS>
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_FOLDERS>
>(
  { allCommunities: [], communitiesDetails: {}, communitiesFoldersMeta: {}, pendingCommunities: [] },
  {
    [communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE>;
      return {
        ...state,
        allCommunities: staleOrSplice({
          newData: action.payload.newData.items,
          previousData: state.allCommunities,
          reloadAll: action.payload.reloadAll,
          start: action.payload.newData.from,
          total: action.payload.newData.total,
        }),
      };
    },
    [communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE>;
      return {
        ...state,
        pendingCommunities: staleOrSplice({
          newData: action.payload.newData.items,
          previousData: state.pendingCommunities,
          reloadAll: action.payload.reloadAll,
          start: action.payload.newData.from,
          total: action.payload.newData.total,
        }),
      };
    },
    [communitiesActionTypes.LOAD_COMMUNITY_DETAILS]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_DETAILS>;
      return { ...state, communitiesDetails: { ...state.communitiesDetails, [action.payload.id]: action.payload.data } };
    },
    [communitiesActionTypes.LOAD_COMMUNITY_FOLDERS]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_FOLDERS>;
      return {
        ...state,
        communitiesFoldersMeta: {
          ...state.communitiesFoldersMeta,
          [action.payload.communityId]: { ...state.communitiesFoldersMeta[action.payload.communityId], ...action.payload.data },
        },
      };
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
  loadCommunityFoldersMeta: (
    communityId: keyof CommunitiesStore['communitiesFoldersMeta'],
    data: CommunitiesStore['communitiesFoldersMeta'][any],
  ) => ({
    payload: { communityId, data },
    type: communitiesActionTypes.LOAD_COMMUNITY_FOLDERS,
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
  getCommunityFolderMeta:
    (
      communityId: keyof CommunitiesStore['communitiesFoldersMeta'],
      folderId?: keyof CommunitiesStore['communitiesFoldersMeta'][number],
    ) =>
    (state: IGlobalState) => (folderId ? moduleConfig.getState(state).communitiesFoldersMeta[communityId][folderId] : undefined),
  getPendingCommunities: (state: IGlobalState) => moduleConfig.getState(state).pendingCommunities,
};
