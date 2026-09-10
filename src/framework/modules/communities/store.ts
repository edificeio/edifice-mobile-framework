import { DiscussionDto, InvitationResponseDto } from '@edifice.io/community-client-rest-rn';
import {
  CommunityResponseDtoWithThumbnails,
  InvitationResponseDtoWithThumbnails,
} from '@edifice.io/community-client-rest-rn/utils';

import { IGlobalState } from '~/app/store';
import { FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { LOADING_ITEM_DATA, staleOrSplice } from '~/framework/components/list/paginated-list';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import moduleConfig from './module-config';

/**
 * Details of a community, shared by every screen of the module.
 * Members are optional: screens that only need the community itself (banner image, title…) can load it without them.
 */
export type CommunityDetails = Pick<CommunityResponseDtoWithThumbnails, 'title' | 'image' | 'mobileThumbnails'> & {
  courseEntId?: string;
  totalMembers?: number;
  membersId?: string[];
};

export interface CommunitiesStore {
  allCommunities: (InvitationResponseDtoWithThumbnails | typeof LOADING_ITEM_DATA)[];
  pendingCommunities: (InvitationResponseDtoWithThumbnails | typeof LOADING_ITEM_DATA)[];
  communitiesDetails: Record<number, CommunityDetails>;
  communitiesDiscussions: Record<number, Record<number, DiscussionDto>>;
  communitiesFoldersMeta: Record<number, Record<number, Pick<FolderItem, 'title'>>>;
}

export const communitiesActionTypes = {
  LOAD_ALL_COMMUNITIES_PAGE: moduleConfig.namespaceActionType('LOAD_ALL_COMMUNITIES_PAGE') as `${string}_LOAD_ALL_COMMUNITIES_PAGE`,
  LOAD_COMMUNITY_DETAILS: moduleConfig.namespaceActionType('LOAD_COMMUNITY_DETAILS') as `${string}_LOAD_COMMUNITY_DETAILS`,
  LOAD_COMMUNITY_DISCUSSIONS: moduleConfig.namespaceActionType(
    'LOAD_COMMUNITY_DISCUSSIONS',
  ) as `${string}_LOAD_COMMUNITY_DISCUSSIONS`,
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
    : T extends typeof communitiesActionTypes.LOAD_COMMUNITY_DISCUSSIONS
      ? {
          type: typeof communitiesActionTypes.LOAD_COMMUNITY_DISCUSSIONS;
          payload: { communityId: number; data: CommunitiesStore['communitiesDiscussions'][any] };
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
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_DISCUSSIONS>
  | CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_FOLDERS>
>(
  { allCommunities: [], communitiesDetails: {}, communitiesDiscussions: {}, communitiesFoldersMeta: {}, pendingCommunities: [] },
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
      return {
        ...state,
        communitiesDetails: {
          ...state.communitiesDetails,
          // Merged, not replaced: a screen loading only the community itself must not drop the members loaded by another one.
          [action.payload.id]: { ...state.communitiesDetails[action.payload.id], ...action.payload.data },
        },
      };
    },
    [communitiesActionTypes.LOAD_COMMUNITY_DISCUSSIONS]: (state, _action) => {
      const action = _action as CommunitiesAction<typeof communitiesActionTypes.LOAD_COMMUNITY_DISCUSSIONS>;
      return {
        ...state,
        communitiesDiscussions: {
          ...state.communitiesDiscussions,
          [action.payload.communityId]: {
            ...state.communitiesDiscussions[action.payload.communityId],
            ...action.payload.data,
          },
        },
      };
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
  loadCommunityDiscussions: (
    communityId: keyof CommunitiesStore['communitiesDiscussions'],
    data: CommunitiesStore['communitiesDiscussions'][any],
  ) => ({
    payload: { communityId, data },
    type: communitiesActionTypes.LOAD_COMMUNITY_DISCUSSIONS,
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
  getCommunityDiscussion:
    (communityId: keyof CommunitiesStore['communitiesDiscussions'], discussionId: number) =>
    (state: IGlobalState): DiscussionDto | undefined =>
      moduleConfig.getState(state).communitiesDiscussions[communityId]?.[discussionId],
  getCommunityFolderMeta:
    (
      communityId: keyof CommunitiesStore['communitiesFoldersMeta'],
      folderId?: keyof CommunitiesStore['communitiesFoldersMeta'][number],
    ) =>
    (state: IGlobalState) => (folderId ? moduleConfig.getState(state).communitiesFoldersMeta[communityId][folderId] : undefined),
  getPendingCommunities: (state: IGlobalState) => moduleConfig.getState(state).pendingCommunities,
};
