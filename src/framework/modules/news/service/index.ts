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

const apiLevel = '/actualites/api/v1';
export const newsService = {
  comments: {
    delete: async (infoId: number, commentId: number) => {
      const api = `${apiLevel}/infos/${infoId}/comments/${commentId}`;

      return sessionFetch(api, { method: 'DELETE' });
    },
    get: async newsId => {
      const api = `${apiLevel}/infos/${newsId}/comments`;
      const backendComments = await sessionFetch.json<BackendNewsCommentItem[]>(api);

      return backendComments.map(newsCommentItemAdapter);
    },
    post: async (infoId: number, comment: string) => {
      const api = `${apiLevel}/infos/${infoId}/comments`;

      const body = JSON.stringify({ comment, info_id: infoId });
      return sessionFetch.json(api, { body, method: 'POST' });
    },
    update: async (infoId: number, comment: string, commentId: number) => {
      const api = `${apiLevel}/infos/${infoId}/comments/${commentId}`;

      const body = JSON.stringify({ comment, info_id: infoId });
      return sessionFetch.json(api, { body, method: 'PUT' });
    },
  },
  info: {
    delete: async (infoId: number) => {
      const api = `${apiLevel}/infos/${infoId}`;

      return sessionFetch(api, { method: 'DELETE' });
    },
    get: async infoId => {
      const api = `${apiLevel}/infos/${infoId}`;
      const backendInfo = await sessionFetch.json<BackendNewsItemDetails>(api);

      return newsItemDetailsAdapter(backendInfo);
    },
  },
  infos: {
    get: async (page, threadId?, isRefresh?) => {
      const PAGE_SIZE = 20;
      const api = isRefresh
        ? `${apiLevel}/infos?page=0&pageSize=${(page + 1) * PAGE_SIZE}${threadId ? '&threadIds=' + threadId : ''}`
        : `${apiLevel}/infos?page=${page}&pageSize=${PAGE_SIZE}${threadId ? '&threadIds=' + threadId : ''}`;
      const backendNews = await sessionFetch.json<BackendNewsItem[]>(api);

      return backendNews.map(newsItemAdapter);
    },
  },
  threads: {
    get: async () => {
      const api = `${apiLevel}/threads`;
      const backendThreads = await sessionFetch.json<BackendNewsThreadItem[]>(api);

      return backendThreads.map(newsThreadItemAdapter);
    },
  },
};

export const newsUriCaptureFunction = url => {
  const newsInfoRegex = /^\/actualites.+\/info\/(\d+)/;
  return url.match(newsInfoRegex)?.[1];
};
