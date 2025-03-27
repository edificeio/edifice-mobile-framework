import { Temporal } from '@js-temporal/polyfill';

import { Wiki, WikiResourceMetadata } from '../model';
import { API } from './types';

import http from '~/framework/util/http';

const hydrateWikiResourceInfo = (data: API.Wiki.ListPagesResponse): WikiResourceMetadata => ({
  assetId: data._id, // Explorer.assetId = Wiki.id. Explorer.id is something else that does not depend on the application.
  createdAt: Temporal.Instant.from(data.created.$date),
  creatorId: data.owner.userId,
  creatorName: data.owner.displayName,
  name: data.title,
  thumbnail: data.thumbnail,
  updatedAt: Temporal.Instant.from((data.modified ?? data.created).$date),
});

const walkDepthCompute = (
  page: API.Wiki.ListPagesResponse['pages'][0] & { depth?: number },
  id: string,
  all: Map<string, API.Wiki.ListPagesResponse['pages'][0] & { depth?: number }>,
  currentDepth: number = 0,
) => {
  if (page.depth !== undefined) return;
  page.depth = currentDepth;
  if (page.children === undefined) return;
  for (const childData of page.children) {
    const child = all.get(childData._id);
    if (!child) return;
    walkDepthCompute(child, child._id, all, currentDepth + 1);
  }
};

const hydrateWikiData = (data: API.Wiki.ListPagesResponse): Wiki => {
  const pagesAsMap = new Map<string, API.Wiki.ListPagesResponse['pages'][0] & { depth?: number }>(
    data.pages.sort((a, b) => a.position - b.position).map(page => [page._id, { ...page, depth: undefined }]),
  );
  pagesAsMap.forEach(walkDepthCompute);

  return {
    description: data.description,
    pages: Array.from(pagesAsMap, ([_id, page]) => ({
      childrenIds: page.children?.map(child => child._id) ?? [],
      depth: page.depth ?? 0,
      id: page._id,
      isVisible: page.isVisible,
      parentId: page.parentId ?? undefined,
      position: page.position,
      title: page.title,
    })),
    ...hydrateWikiResourceInfo(data),
  };
};

export default {
  wiki: {
    get: async (opts: API.Wiki.ListPagesPayload) => {
      const rawData: API.Wiki.ListPagesResponse = await http.fetchJsonForSession(`/wiki/${opts.id}`);
      return hydrateWikiData(rawData);
    },
  },
};
