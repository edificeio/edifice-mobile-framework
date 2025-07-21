import { Temporal } from '@js-temporal/polyfill';
import isDisjointFrom from 'set.prototype.isdisjointfrom';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { Wiki, WikiPage, WikiResourceMetadata } from '~/framework/modules/wiki/model';
import { API } from '~/framework/modules/wiki/service/types';
import http from '~/framework/util/http';
import { ArrayElement } from '~/utils/types';

const hydrateWikiResourceInfo = (data: API.Wiki.ListPagesResponse): WikiResourceMetadata => ({
  assetId: data._id, // Explorer.assetId = Wiki.id. Explorer.id is something else that does not depend on the application.
  createdAt: Temporal.Instant.from((data.created ?? data.modified).$date),
  creatorId: data.owner.userId,
  creatorName: data.owner.displayName,
  name: data.title,
  thumbnail: data.thumbnail,
  updatedAt: Temporal.Instant.from(data.modified.$date),
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

const rightsThatSeeHiddenPages = new Set(['creator', 'manager']); // Business rule here. Need to be implemented into the backend.

const hydrateWikiData = (data: API.Wiki.ListPagesResponse, session: AuthActiveAccount): Wiki => {
  const rights = computeRights(data, session);
  const showHiddenPages: boolean = !isDisjointFrom(rightsThatSeeHiddenPages, new Set(rights)); // Business rule here. Need to be implemented into the backend.
  const sortByPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;
  const preorderedPages = data.pages.sort(sortByPosition);

  const pagesAsMap = new Map<string, ArrayElement<API.Wiki.ListPagesResponse['pages']>>();
  for (let i = 0; i < preorderedPages.length; i++) {
    pagesAsMap.set(preorderedPages[i]._id, preorderedPages[i]);
  }

  const orderedPagesAsMap = new Map<string, ArrayElement<API.Wiki.ListPagesResponse['pages']> & { depth?: number }>();

  const addChildrenPagesInMap = (children: ArrayElement<API.Wiki.ListPagesResponse['pages']>['children'], currentDepth: number) => {
    if (!children) return;
    for (const child of children.sort(sortByPosition)) {
      addPageInMap(pagesAsMap.get(child._id), currentDepth);
    }
  };

  const addPageInMap = (page: ArrayElement<API.Wiki.ListPagesResponse['pages']> | undefined, currentDepth: number) => {
    if (!page) return;
    if (!orderedPagesAsMap.has(page._id)) orderedPagesAsMap.set(page._id, { ...page, depth: currentDepth });
    addChildrenPagesInMap(page.children, currentDepth + 1);
  };

  pagesAsMap.forEach(page => {
    addPageInMap(page, 0);
  });

  let orderedPagesAsArray = Array.from(orderedPagesAsMap.values());
  if (!showHiddenPages) {
    orderedPagesAsArray = orderedPagesAsArray.filter(page => page.isVisible);
  }

  return {
    description: data.description,
    pages: orderedPagesAsArray.map(page => ({
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
  createdAt: Temporal.Instant.from((data.created ?? data.modified).$date),
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
