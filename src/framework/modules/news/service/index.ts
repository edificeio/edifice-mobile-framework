import moment from 'moment';

import {
  NewsCommentItem,
  NewsItem,
  NewsItemDetails,
  NewsItemRights,
  NewsItemStatus,
  NewsOwner,
  NewsThreadItem,
  NewsThreadItemRights,
} from '~/framework/modules/news/model';
import { fetchJSONWithCache, signedFetchJsonRelative } from '~/infra/fetchWithCache';

export interface BackendNewsItem {
  id: number;
  threadId: number;
  content: string;
  status: string;
  owner: NewsOwner;
  created: string;
  modified: string;
  publicationDate: string | null;
  expirationDate: string | null;
  numberOfComments: number;
  title: string;
  headline: boolean;
  sharedRights: string[];
}

export interface BackendNewsItemDetails extends Omit<BackendNewsItem, 'threadId'> {
  thread: {
    id: number;
    title: string;
    icon: string;
    owner: NewsOwner;
    sharedRights: string[];
  };
}

export interface BackendNewsThreadItem {
  title: string;
  id: number;
  icon: string | null;
  created: string;
  modified: string;
  owner: NewsOwner;
  sharedRights: string[];
}

export interface BackendNewsCommentItem {
  _id: number;
  comment: string;
  owner: string;
  created: string;
  modified: string;
  username: string;
  info_id: number;
}

export const newsItemAdapter = (n: BackendNewsItem) => {
  const ret = {
    content: n.content,
    created: moment(n.created),
    expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
    headline: n.headline,
    id: n.id,
    modified: moment(n.modified),
    numberOfComments: n.numberOfComments,
    owner: {
      deleted: n.owner.deleted,
      displayName: n.owner.displayName,
      id: n.owner.id,
    },
    publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
    sharedRights: n.sharedRights as NewsItemRights[],
    status: n.status as NewsItemStatus,
    threadId: n.threadId,
    title: n.title,
  };
  return ret as NewsItem;
};

export const newsItemDetailsAdapter = (n: BackendNewsItemDetails) => {
  const ret = {
    news: {
      content: n.content,
      created: moment(n.created),
      expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
      headline: n.headline,
      id: n.id,
      modified: moment(n.modified),
      numberOfComments: n.numberOfComments,
      owner: {
        deleted: n.owner.deleted,
        displayName: n.owner.displayName,
        id: n.owner.id,
      },
      publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
      sharedRights: n.sharedRights as NewsItemRights[],
      status: n.status as NewsItemStatus,
      threadId: n.thread.id,
      title: n.title,
    },
    thread: {
      icon: n.thread.icon,
      ownerId: n.thread.owner.id,
      sharedRights: n.thread.sharedRights as NewsThreadItemRights[],
      title: n.thread.title,
    },
  };
  return ret as NewsItemDetails;
};

export const newsThreadItemAdapter = (n: BackendNewsThreadItem) => {
  const ret = {
    created: moment(n.created),
    icon: n.icon,
    id: n.id,
    modified: moment(n.created),
    owner: {
      deleted: n.owner.deleted,
      displayName: n.owner.displayName,
      id: n.owner.id,
    },
    sharedRights: n.sharedRights as NewsThreadItemRights[],
    title: n.title,
  };
  return ret as NewsThreadItem;
};

export const newsCommentItemAdapter = (n: BackendNewsCommentItem) => {
  const ret = {
    comment: n.comment,
    created: moment(n.created),
    id: n._id,
    infoId: n.info_id,
    modified: moment(n.modified),
    owner: n.owner,
    username: n.username,
  };
  return ret as NewsCommentItem;
};

export const newsService = {
  comments: {
    delete: async (infoId: number, commentId: number) => {
      const api = `/actualites/info/${infoId}/comment/${commentId}`;

      return signedFetchJsonRelative(`${api}`, {
        method: 'DELETE',
      });
    },
    get: async newsId => {
      const api = `/actualites/infos/${newsId}/comments`;
      const backendComments = (await fetchJSONWithCache(api)) as BackendNewsCommentItem[];

      const comments = backendComments.map(comment => newsCommentItemAdapter(comment));
      return comments as NewsCommentItem[];
    },
    post: async (infoId: number, comment: string) => {
      const api = `/actualites/info/${infoId}/comment`;

      const body = JSON.stringify({ comment, info_id: infoId });
      return signedFetchJsonRelative(`${api}`, {
        body,
        method: 'PUT',
      });
    },
    update: async (infoId: number, comment: string, commentId: number) => {
      const api = `/actualites/info/${infoId}/comment/${commentId}`;

      const body = JSON.stringify({ comment, info_id: infoId });
      return signedFetchJsonRelative(`${api}`, {
        body,
        method: 'PUT',
      });
    },
  },
  info: {
    delete: async (threadId: number, infoId: number) => {
      const api = `/actualites/thread/${threadId}/info/${infoId}`;

      return signedFetchJsonRelative(`${api}`, {
        method: 'DELETE',
      });
    },
    get: async infoId => {
      const api = `/actualites/info/${infoId}`;
      const backendInfo = (await fetchJSONWithCache(api)) as BackendNewsItemDetails;

      const news = newsItemDetailsAdapter(backendInfo);
      return news as NewsItemDetails;
    },
  },
  infos: {
    get: async (page, threadId?, isRefresh?) => {
      const PAGE_SIZE = 20;
      const api = isRefresh
        ? `/actualites/list?page=0&pageSize=${(page + 1) * PAGE_SIZE}${threadId ? '&threadId=' + threadId : ''}`
        : `/actualites/list?page=${page}&pageSize=${PAGE_SIZE}${threadId ? '&threadId=' + threadId : ''}`;
      const backendNews = (await fetchJSONWithCache(api)) as BackendNewsItem[];

      const news = backendNews.map(newsItem => newsItemAdapter(newsItem));
      return news as NewsItem[];
    },
  },
  threads: {
    get: async () => {
      const api = `/actualites/threads/list`;
      const backendThreads = (await fetchJSONWithCache(api)) as BackendNewsThreadItem[];

      const threads = backendThreads.map(thread => newsThreadItemAdapter(thread));
      return threads as NewsThreadItem[];
    },
  },
};

export const newsUriCaptureFunction = url => {
  const newsInfoRegex = /^\/actualites.+\/info\/(\d+)/;
  return url.match(newsInfoRegex)?.[1];
};
