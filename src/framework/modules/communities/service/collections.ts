import { CollectionClient, CollectionDto, CollectionSubmissionDto } from '@edifice.io/collect-client-rest-rn';
import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import { COLLECT_API } from '~/framework/modules/communities/module-config';
import { sessionApi } from '~/framework/util/transport';

export const getCollectionsByCollectId = async (
  collectIds: number[],
  userRole?: MembershipRole,
): Promise<{
  adminCollections: Map<number, CollectionDto>;
  memberSubmissions: Map<number, CollectionSubmissionDto>;
}> => {
  if (!collectIds.length) return { adminCollections: new Map(), memberSubmissions: new Map() };

  const collectClient = sessionApi(COLLECT_API, CollectionClient as any) as unknown as CollectionClient; // bug with CollectionClient typings
  const queryParams = { ids: collectIds, size: collectIds.length };
  const [{ items: collections }, { items: submissions }] = await Promise.all([
    userRole === MembershipRole.ADMIN
      ? collectClient.getCollections(queryParams).catch(() => ({ items: [] as CollectionDto[] }))
      : { items: [] as CollectionDto[] },
    collectClient.getCollectionsToSubmit(queryParams),
  ]);

  return {
    adminCollections: new Map(collections.map(collection => [collection.id, collection])),
    memberSubmissions: new Map(submissions.map(submission => [submission.collectionId, submission])),
  };
};
