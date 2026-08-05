import { Temporal } from '@js-temporal/polyfill';
import isDisjointFrom from 'set.prototype.isdisjointfrom';

import {
  CommentItem,
  CommentItemDeleted,
  ITEM_COMMENT,
  ITEM_COMMENT_DELETED,
  ITEM_RESPONSE,
  ITEM_RESPONSE_DELETED,
  ResponseItem,
  ResponseItemDeleted,
  SocialResourceViewer,
} from '~/framework/components/pages/social-resource-viewer/types';
import { AccountType, AuthActiveAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { Wiki, WikiPage, WikiResourceMetadata } from '~/framework/modules/wiki/model';
import { API } from '~/framework/modules/wiki/service/types';
import { sessionFetch } from '~/framework/util/transport/fetch';
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
  comments: hydratePageComments(data.comments),
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

type ParsingCommentOrResponse = Partial<ArrayElement<SocialResourceViewer.Props['comments']>> &
  Pick<ArrayElement<SocialResourceViewer.Props['comments']>, 'id' | 'date' | 'type'>;

const hydratePageComments = (data: API.Wiki.GetPageResponse['comments'] = []): SocialResourceViewer.Props['comments'] => {
  const parsedComments: [
    (CommentItem | CommentItemDeleted | ResponseItem | ResponseItemDeleted)['id'],
    (CommentItem | CommentItemDeleted | ResponseItem | ResponseItemDeleted)[],
  ][] = [];
  const parsedResponses: [(ResponseItem | ResponseItemDeleted)['id'], ResponseItem | ResponseItemDeleted][] = [];

  // 1. Parse data
  for (const item of data) {
    const ret: ParsingCommentOrResponse = {
      date: Temporal.Instant.from(item.created.$date),
      hasResponses: false,
      id: item._id,
      type:
        'deleted' in item
          ? 'replyTo' in item
            ? ITEM_RESPONSE_DELETED
            : ITEM_COMMENT_DELETED
          : 'replyTo' in item
            ? ITEM_RESPONSE
            : ITEM_COMMENT,
    };
    if (ret.type === ITEM_RESPONSE_DELETED || ret.type === ITEM_RESPONSE) {
      ret.inReplyTo = (item as API.Wiki.GetPageCommentResponse | API.Wiki.GetPageCommentResponseDeleted).replyTo;
    }
    if (ret.type === ITEM_COMMENT || ret.type === ITEM_RESPONSE) {
      ret.value = (item as API.Wiki.GetPageCommentResponse | API.Wiki.GetPageComment).comment;
      ret.authorId = (item as API.Wiki.GetPageCommentResponse | API.Wiki.GetPageComment).author;
      ret.authorName = (item as API.Wiki.GetPageCommentResponse | API.Wiki.GetPageComment).authorName;
      ret.authorAccountType = AccountType.Relative; // ToDo get actuel account type
    }

    if ('inReplyTo' in ret && ret.inReplyTo) {
      parsedResponses.push([ret.inReplyTo, ret as ResponseItem | ResponseItemDeleted]);
    } else {
      parsedComments.push([ret.id, [ret as CommentItem | CommentItemDeleted]]);
    }
  }

  // 2. Sort data
  parsedComments.sort((a, b) => Temporal.Instant.compare(a[1][0].date, b[1][0].date));
  parsedResponses.sort((a, b) => Temporal.Instant.compare(a[1].date, b[1].date));
  const comments = Object.fromEntries(parsedComments);
  for (const [commentId, response] of parsedResponses) {
    if (commentId in comments) comments[commentId].push(response);
  }

  // 3. Set 'hasResponses' flags
  for (const commentId in comments) {
    comments[commentId].forEach((item, index, all) => {
      item.hasResponses = index < all.length - 1;
    });
  }

  return Object.values(comments).flat();
};

export default {
  page: {
    get: async (opts: API.Wiki.GetPagePayload) => {
      const rawData = await sessionFetch.json<API.Wiki.GetPageResponse>(`/wiki/${opts.id}/page/${opts.pageId}`);
      return hydrateWikiPageData(rawData);
    },
  },
  wiki: {
    get: async (opts: API.Wiki.ListPagesPayload) => {
      const rawData = await sessionFetch.json<API.Wiki.ListPagesResponse>(`/wiki/${opts.id}`);
      return hydrateWikiData(rawData, getSession()!);
    },
  },
};
