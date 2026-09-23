import {
  CommunityType,
  InvitationClient,
  InvitationFields,
  InvitationStatus,
  InvitationTargetType,
  SortDirection,
  UserInvitationSortField,
} from '@edifice.io/community-client-rest-rn';
import { InvitationResponseDtoWithThumbnails } from '@edifice.io/community-client-rest-rn/utils';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/communities/module-config';
import { accountApi } from '~/framework/util/transport';

const INVITATION_FIELDS: InvitationFields[] = ['stats', 'community'];

export const getInvitations = async (
  session: AuthActiveAccount,
  page: number,
  size: number,
  { communityType, status }: { communityType?: CommunityType; status?: InvitationStatus } = {},
): Promise<{ items: InvitationResponseDtoWithThumbnails[]; total: number }> => {
  const { items, meta } = await accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
    communityType,
    fields: INVITATION_FIELDS,
    page: page + 1,
    size,
    sortBy: UserInvitationSortField.COMMUNITY_TITLE,
    sortDirection: SortDirection.ASC,
    status,
    targetType: InvitationTargetType.ALL,
  });

  return { items, total: meta.totalItems };
};

export const getInvitationWithCommunity = async (
  session: AuthActiveAccount,
  invitationId: number,
  communityId: number,
): Promise<InvitationResponseDtoWithThumbnails> => {
  const { items } = await accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
    communityId,
    fields: INVITATION_FIELDS,
    targetType: InvitationTargetType.ALL,
  });
  const invitation = items.find(item => item.id === invitationId);
  if (!invitation) throw new Error(`Invitation ${invitationId} not found in community ${communityId}`);

  return invitation;
};

export const getPendingInvitationsCount = async (session: AuthActiveAccount): Promise<number> => {
  const { meta } = await accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
    size: 1,
    status: InvitationStatus.PENDING,
    targetType: InvitationTargetType.ALL,
  });

  return meta.totalItems;
};
