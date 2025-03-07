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

const hydrateWikiData = (data: API.Wiki.ListPagesResponse): Wiki => {
  const pagesAsMap = new Map(data.pages.map(page => [page._id, { ...page, depth: 0 }]));

  pagesAsMap.forEach(page => {
    let currentPage: typeof page | undefined = page;
    while (currentPage?.parentId) {
      ++page.depth;
      currentPage = pagesAsMap.get(currentPage.parentId);
    }
    pagesAsMap.set(page._id, page);
  });

  return {
    description: data.description,
    pages: Array.from(pagesAsMap, ([_id, page]) => ({
      childrenIds: page.children?.map(child => child._id) ?? [],
      depth: page.depth!,
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
