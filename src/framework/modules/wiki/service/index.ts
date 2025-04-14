import { Temporal } from '@js-temporal/polyfill';
import isDisjointFrom from 'set.prototype.isdisjointfrom';

import { AuthActiveAccount } from '../../auth/model';
import { getSession } from '../../auth/reducer';
import { Wiki, WikiPage, WikiResourceMetadata } from '../model';
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

const computeRights = (data: Pick<API.Wiki.ListPagesResponse, 'rights'>, session: AuthActiveAccount) => {
  const rights: string[] = [];
  for (const rightStr of data.rights) {
    const right = rightStr.split(':'); // 0: target, 1: id, 2: right if not creator
    switch (right[0]) {
      case 'creator':
        if (right[1] === session.user.id) rights.push(right[0]);
        break;
      case 'user':
        if (right[1] === session.user.id) rights.push(right[2]);
        break;
      case 'group':
        if (session.user.groups.includes(right[1])) rights.push(right[2]);
        break;
    }
  }
  return rights;
};

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
    if (!child) continue;
    walkDepthCompute(child, child._id, all, currentDepth + 1);
  }
};

const rightsThatSeeHiddenPages = new Set(['creator', 'manager']); // Business rule here. Need to be implemented into the backend.

const hydrateWikiData = (data: API.Wiki.ListPagesResponse, session: AuthActiveAccount): Wiki => {
  const rights = computeRights(data, session);

  const pagesAsArray: [
    API.Wiki.ListPagesResponse['pages'][0]['_id'],
    API.Wiki.ListPagesResponse['pages'][0] & { depth?: number },
  ][] = [];
  const showHiddenPages: boolean = !isDisjointFrom(rightsThatSeeHiddenPages, new Set(rights)); // Business rule here. Need to be implemented into the backend.
  for (const page of data.pages) {
    if (!page.isVisible && !showHiddenPages) continue; // Business rule here. Need to be implemented into the backend.
    pagesAsArray.push([page._id, { ...page, depth: undefined }]);
  }
  const pagesAsMap = new Map<string, API.Wiki.ListPagesResponse['pages'][0] & { depth?: number }>(
    pagesAsArray.sort((a, b) => a[1].position - b[1].position),
  );
  pagesAsMap.forEach(walkDepthCompute);

  return {
    description: data.description,
    pages: Array.from(pagesAsMap, ([_id, page]) => ({
      childrenIds: page.children?.sort((a, b) => a.position - b.position).map(child => child._id) ?? [],
      depth: page.depth ?? 0,
      id: page._id,
      isVisible: page.isVisible,
      parentId: page.parentId ?? undefined,
      position: page.position,
      title: page.title,
    })),
    ...hydrateWikiResourceInfo(data),
    rights,
  };
};

const hydrateWikiPageData = (data: API.Wiki.GetPageResponse): WikiPage => ({
  content: data.content,
  contentVersion: data.contentVersion,
  createdAt: Temporal.Instant.from(data.created.$date),
  creatorId: data.author,
  creatorName: data.authorName,
  id: data._id,
  isVisible: data.isVisible,
  title: data.title,
  updatedAt: data.modified ? Temporal.Instant.from(data.modified.$date) : undefined,
  updaterId: data.lastContributer,
  updaterName: data.lastContributerName,
});

export default {
  page: {
    get: async (opts: API.Wiki.GetPagePayload) => {
      const rawData: API.Wiki.GetPageResponse = await http.fetchJsonForSession(`/wiki/${opts.id}/page/${opts.pageId}`);
      return hydrateWikiPageData(rawData);
    },
  },
  wiki: {
    get: async (opts: API.Wiki.ListPagesPayload) => {
      const rawData: API.Wiki.ListPagesResponse = await http.fetchJsonForSession(`/wiki/${opts.id}`);
      return hydrateWikiData(rawData, getSession()!);
    },
  },
};
