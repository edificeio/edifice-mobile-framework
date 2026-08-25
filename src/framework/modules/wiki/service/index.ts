import { Temporal } from '@js-temporal/polyfill';
import isDisjointFrom from 'set.prototype.isdisjointfrom';

import { SocialResourceViewer } from '~/framework/components/pages/social-resource-viewer/types';
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
  const rights: Set<string> = new Set();
  for (const rightStr of data.rights) {
    const right = rightStr.split(':'); // 0: target, 1: id, 2: right if not creator
    switch (right[0]) {
      case 'creator':
        if (right[1] === session.user.id) rights.add(right[0]);
        break;
      case 'user':
        if (right[1] === session.user.id) rights.add(right[2]);
        break;
      case 'group':
        if (session.user.groups.includes(right[1])) rights.add(right[2]);
        break;
    }
  }
  return [...rights];
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

const hydrateWikiPageData = async (data: API.Wiki.GetPageResponse): Promise<WikiPage> => ({
  comments: await hydratePageComments(data.comments),
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

const parseAccountTypesMap = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
} as const;

const hydratePageComments = async (
  data: API.Wiki.GetPageResponse['comments'] = [],
): Promise<SocialResourceViewer.Props['data']> => {
  // 1. Fetch fucking account type for each author because backend does not provide them by itself.
  const authors = new Set<
    (
      | SocialResourceViewer.CommentItem
      | SocialResourceViewer.ResponseItem
      | SocialResourceViewer.CommentItemDeleted
      | SocialResourceViewer.ResponseItemDeleted
    )['authorId']
  >();
  for (const item of data) {
    if ('author' in item) authors.add(item.author);
  }
  const userTypes = Object.fromEntries(
    await Promise.all(
      [...authors].map(async authorId => {
        const userData = await sessionFetch.json<{
          status: 'ok';
          result: Record<string, { type: (keyof typeof parseAccountTypesMap)[] }>;
        }>(`/userbook/api/person?id=${authorId}`);
        return [authorId, parseAccountTypesMap[userData.result[0]?.type[0]] ?? undefined] as const;
      }),
    ),
  );

  // 2. Prepare parsed data arrays.
  const parsedComments: Record<
    (SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted)['id'],
    Omit<SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted, 'responses'>
  > = {};
  const parsedResponses: Record<
    (SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted)['id'],
    (SocialResourceViewer.ResponseItem | SocialResourceViewer.ResponseItemDeleted)[]
  > = {};

  // 3. Parse data
  for (const item of data) {
    const ret: Pick<
      | SocialResourceViewer.CommentItem
      | SocialResourceViewer.CommentItemDeleted
      | SocialResourceViewer.ResponseItem
      | SocialResourceViewer.ResponseItemDeleted,
      'id' | 'date'
    > &
      Partial<
        Pick<
          SocialResourceViewer.CommentItem | SocialResourceViewer.ResponseItem,
          'authorAccountType' | 'authorId' | 'authorName' | 'content' | 'isRichContent'
        >
      > &
      Partial<Pick<SocialResourceViewer.CommentItemDeleted | SocialResourceViewer.ResponseItemDeleted, 'deleted'>> = {
      date: Temporal.Instant.from(item.created.$date),
      id: item._id,
    };
    if (!('deleted' in item)) {
      ret.authorId = item.author;
      ret.authorName = item.authorName;
      ret.authorAccountType = userTypes[item.author] ?? AccountType.Guest; // use guest if user is not found... Don't known what to do.
      ret.content = item.comment;
      ret.isRichContent = false;
    } else {
      ret.deleted = true;
    }

    if ('replyTo' in item) {
      if (!(item.replyTo in parsedResponses)) parsedResponses[item.replyTo] = [];
      parsedResponses[item.replyTo].push(ret as SocialResourceViewer.ResponseItem | SocialResourceViewer.ResponseItemDeleted);
    } else {
      parsedComments[ret.id] = ret as SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted;
    }
  }

  // 4. Compose & sort data
  const sortedComments = Object.values(parsedComments).sort((a, b) => Temporal.Instant.compare(b.date, a.date)); // comments are in reverse-ordrer
  for (const comment of sortedComments) {
    (comment as SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted).responses =
      comment.id in parsedResponses ? parsedResponses[comment.id].sort((a, b) => Temporal.Instant.compare(a.date, b.date)) : [];
  }

  return sortedComments as (SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted)[];
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
