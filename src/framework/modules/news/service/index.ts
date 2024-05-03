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
    id: n.id,
    threadId: n.threadId,
    content: n.content,
    status: n.status as NewsItemStatus,
    owner: {
      id: n.owner.id,
      displayName: n.owner.displayName,
      deleted: n.owner.deleted,
    },
    created: moment(n.created),
    modified: moment(n.modified),
    publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
    expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
    numberOfComments: n.numberOfComments,
    title: n.title,
    headline: n.headline,
    sharedRights: n.sharedRights as NewsItemRights[],
  };
  return ret as NewsItem;
};

export const newsItemDetailsAdapter = (n: BackendNewsItemDetails) => {
  const ret = {
    news: {
      id: n.id,
      threadId: n.thread.id,
      content: n.content,
      status: n.status as NewsItemStatus,
      owner: {
        id: n.owner.id,
        displayName: n.owner.displayName,
        deleted: n.owner.deleted,
      },
      created: moment(n.created),
      modified: moment(n.modified),
      publicationDate: n.publicationDate ? moment(n.publicationDate) : null,
      expirationDate: n.expirationDate ? moment(n.expirationDate) : null,
      numberOfComments: n.numberOfComments,
      title: n.title,
      headline: n.headline,
      sharedRights: n.sharedRights as NewsItemRights[],
    },
    thread: {
      title: n.thread.title,
      icon: n.thread.icon,
      sharedRights: n.thread.sharedRights as NewsThreadItemRights[],
      ownerId: n.thread.owner.id,
    },
  };
  return ret as NewsItemDetails;
};

export const newsThreadItemAdapter = (n: BackendNewsThreadItem) => {
  const ret = {
    title: n.title,
    id: n.id,
    icon: n.icon,
    created: moment(n.created),
    modified: moment(n.created),
    owner: {
      id: n.owner.id,
      displayName: n.owner.displayName,
      deleted: n.owner.deleted,
    },
    sharedRights: n.sharedRights as NewsThreadItemRights[],
  };
  return ret as NewsThreadItem;
};

export const newsCommentItemAdapter = (n: BackendNewsCommentItem) => {
  const ret = {
    id: n._id,
    infoId: n.info_id,
    comment: n.comment,
    owner: n.owner,
    created: moment(n.created),
    modified: moment(n.modified),
    username: n.username,
  };
  return ret as NewsCommentItem;
};

export const newsService = {
  threads: {
    get: async () => {
      const api = `/actualites/threads/list`;
      const backendThreads = (await fetchJSONWithCache(api)) as BackendNewsThreadItem[];

      const threads = backendThreads.map(thread => newsThreadItemAdapter(thread));
      return threads as NewsThreadItem[];
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
  info: {
    get: async infoId => {
      const api = `/actualites/info/${infoId}`;
      const backendInfo = (await fetchJSONWithCache(api)) as BackendNewsItemDetails;

      const news = newsItemDetailsAdapter(backendInfo);
      return news as NewsItemDetails;
    },
    delete: async (threadId: number, infoId: number) => {
      const api = `/actualites/thread/${threadId}/info/${infoId}`;

      return signedFetchJsonRelative(`${api}`, {
        method: 'DELETE',
      });
    },
  },
  comments: {
    get: async newsId => {
      const api = `/actualites/infos/${newsId}/comments`;
      const backendComments = (await fetchJSONWithCache(api)) as BackendNewsCommentItem[];

      const comments = backendComments.map(comment => newsCommentItemAdapter(comment));
      return comments as NewsCommentItem[];
    },
    post: async (infoId: number, comment: string) => {
      const api = `/actualites/info/${infoId}/comment`;

      const body = JSON.stringify({ info_id: infoId, comment });
      return signedFetchJsonRelative(`${api}`, {
        method: 'PUT',
        body,
      });
    },
    update: async (infoId: number, comment: string, commentId: number) => {
      const api = `/actualites/info/${infoId}/comment/${commentId}`;

      const body = JSON.stringify({ info_id: infoId, comment });
      return signedFetchJsonRelative(`${api}`, {
        method: 'PUT',
        body,
      });
    },
    delete: async (infoId: number, commentId: number) => {
      const api = `/actualites/info/${infoId}/comment/${commentId}`;

      return signedFetchJsonRelative(`${api}`, {
        method: 'DELETE',
      });
    },
  },
};

export const newsUriCaptureFunction = url => {
  const newsInfoRegex = /^\/actualites.+\/info\/(\d+)/;
  return url.match(newsInfoRegex)?.[1];
};
