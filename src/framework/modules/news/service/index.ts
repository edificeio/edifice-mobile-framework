import {
  newsCommentItemAdapter,
  newsItemAdapter,
  newsItemDetailsAdapter,
  newsThreadItemAdapter,
} from '~/framework/modules/news/service/adapters';
import {
  BackendNewsCommentItem,
  BackendNewsItem,
  BackendNewsItemDetails,
  BackendNewsThreadItem,
} from '~/framework/modules/news/service/types';
import { sessionFetch } from '~/framework/util/transport';

export const newsService = {
  comments: {
    delete: async (infoId: number, commentId: number) => {
      const api = `/actualites/info/${infoId}/comment/${commentId}`;

      return sessionFetch.json(api, { method: 'DELETE' });
    },
    get: async newsId => {
      const api = `/actualites/infos/${newsId}/comments`;
      const backendComments = await sessionFetch.json<BackendNewsCommentItem[]>(api);

      return backendComments.map(newsCommentItemAdapter);
    },
    post: async (infoId: number, comment: string) => {
      const api = `/actualites/info/${infoId}/comment`;

      const body = JSON.stringify({ comment, info_id: infoId });
      return sessionFetch.json(api, { body, method: 'PUT' });
    },
    update: async (infoId: number, comment: string, commentId: number) => {
      const api = `/actualites/info/${infoId}/comment/${commentId}`;

      const body = JSON.stringify({ comment, info_id: infoId });
      return sessionFetch.json(api, { body, method: 'PUT' });
    },
  },
  info: {
    delete: async (threadId: number, infoId: number) => {
      const api = `/actualites/thread/${threadId}/info/${infoId}`;

      return sessionFetch.json(api, { method: 'DELETE' });
    },
    get: async infoId => {
      const api = `/actualites/info/${infoId}`;
      const backendInfo = await sessionFetch.json<BackendNewsItemDetails>(api);

      return newsItemDetailsAdapter(backendInfo);
    },
  },
  infos: {
    get: async (page, threadId?, isRefresh?) => {
      const PAGE_SIZE = 20;
      const api = isRefresh
        ? `/actualites/list?page=0&pageSize=${(page + 1) * PAGE_SIZE}${threadId ? '&threadId=' + threadId : ''}`
        : `/actualites/list?page=${page}&pageSize=${PAGE_SIZE}${threadId ? '&threadId=' + threadId : ''}`;
      const backendNews = await sessionFetch.json<BackendNewsItem[]>(api);

      return backendNews.map(newsItemAdapter);
    },
  },
  threads: {
    get: async () => {
      const api = `/actualites/threads/list`;
      const backendThreads = await sessionFetch.json<BackendNewsThreadItem[]>(api);

      return backendThreads.map(newsThreadItemAdapter);
    },
  },
};

export const newsUriCaptureFunction = url => {
  const newsInfoRegex = /^\/actualites.+\/info\/(\d+)/;
  return url.match(newsInfoRegex)?.[1];
};
