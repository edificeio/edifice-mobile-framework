import { CollectionDto, CollectionSubmissionDto } from '@edifice.io/collect-client-rest-rn';
import {
  AnnouncementClient,
  AnnouncementSearchType,
  AnnouncementType,
  CollectAnnouncementDto,
  InformationAnnouncementDto,
  MembershipRole,
  PageMetadataDto,
  SearchAnnouncementDto,
} from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { AudienceProps } from '~/framework/modules/audience/components/types';
import { audienceService } from '~/framework/modules/audience/service';
import { toMedia } from '~/framework/modules/communities/adapter';
import moduleConfig from '~/framework/modules/communities/module-config';
import { getCollectionsByCollectId } from '~/framework/modules/communities/service/collections';
import { Media } from '~/framework/modules/media';
import { sessionApi } from '~/framework/util/transport';

export const ANNOUNCEMENT_AUDIENCE_REFERER = {
  module: moduleConfig.name,
  resourceType: 'announcement',
};

interface AnnouncementDetailsBase<IdType extends string | number> {
  audience?: AudienceProps['infosReactions'];
  author: {
    userId: string;
    username: string;
  };
  content?: string;
  date?: Temporal.Instant;
  media?: Media[];
  resourceId: IdType;
}

export interface InformationAnnouncementDetails<IdType extends string | number> extends AnnouncementDetailsBase<IdType> {
  type: AnnouncementType.INFORMATION;
}

export interface CollectAnnouncementDetails<IdType extends string | number> extends AnnouncementDetailsBase<IdType> {
  collectId: number;
  collection?: CollectionDto;
  submission?: CollectionSubmissionDto;
  type: AnnouncementType.COLLECT;
}

export type AnnouncementDetails<IdType extends string | number> =
  | InformationAnnouncementDetails<IdType>
  | CollectAnnouncementDetails<IdType>;

export const getAnnouncementsDetails = async (
  communityId: number,
  page: number,
  size: number,
  type: AnnouncementSearchType = AnnouncementSearchType.ALL,
  userRole?: MembershipRole,
): Promise<{ announcements: AnnouncementDetails<number>[]; total: number }> => {
  const baseQueryParams: SearchAnnouncementDto = {
    page: page + 1,
    size,
    type,
  };

  const { items, meta } = (await sessionApi(moduleConfig, AnnouncementClient).getAnnouncements(communityId, baseQueryParams)) as {
    items: (InformationAnnouncementDto | CollectAnnouncementDto)[];
    meta: PageMetadataDto;
  };

  const collectIds = [...new Set(items.filter((i): i is CollectAnnouncementDto => 'collectId' in i).map(i => i.collectId))];
  const { adminCollections, memberSubmissions } = await getCollectionsByCollectId(collectIds, userRole);

  // Audience data is only needed for information announcements
  const informationIds = items.filter(i => !('collectId' in i)).map(i => i.id.toString());
  const reactions = informationIds.length
    ? await audienceService.reaction.getSummary(
        ANNOUNCEMENT_AUDIENCE_REFERER.module,
        ANNOUNCEMENT_AUDIENCE_REFERER.resourceType,
        informationIds,
      )
    : undefined;

  const announcements: AnnouncementDetails<number>[] = items.map(e => {
    const base = {
      author: {
        userId: e.author.entId,
        username: e.author.displayName,
      },
      date: Temporal.Instant.from((e.modificationDate ?? e.publicationDate) as unknown as string),
      resourceId: e.id,
    };

    if ('collectId' in e) {
      return {
        ...base,
        collectId: e.collectId,
        collection: adminCollections.get(e.collectId),
        submission: memberSubmissions.get(e.collectId),
        type: AnnouncementType.COLLECT,
      };
    }

    const resourceReactions = reactions?.reactionsByResource[e.id];

    return {
      ...base,
      audience: resourceReactions
        ? {
            total: resourceReactions.totalReactionsCounter,
            types: resourceReactions.reactionTypes,
            userReaction: resourceReactions.userReaction,
          }
        : undefined,
      content: e.content,
      media: e.media?.map(toMedia) ?? [],
      type: AnnouncementType.INFORMATION,
    };
  });

  return { announcements, total: meta.totalItems };
};
