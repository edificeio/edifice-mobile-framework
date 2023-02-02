/**
 * News services
 */
import moment from 'moment';

import { ISession } from '~/framework/modules/auth/model';
import { INews, RightOwner } from '~/framework/modules/news/reducer';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export interface IEntcoreNews {
  comments: string;
  content: string;
  created: string;
  expiration_date: string | null;
  is_headline: boolean;
  modified: string | null;
  owner: string;
  publication_date: string | null;
  shared: (RightOwner & any)[];
  status: number;
  thread_icon: string;
  thread_id: number;
  thread_title: string;
  title: string;
  username: string;
  _id: number;
}

export const newsAdapter = (n: IEntcoreNews) => {
  const ret = {
    backupData: n,
    comments: JSON.parse(n.comments),
    content: n.content,
    created: moment(n.created),
    expiration_date: typeof n.expiration_date === 'string' ? moment(n.expiration_date) : n.expiration_date,
    is_headline: n.is_headline,
    modified: typeof n.modified === 'string' ? moment(n.modified) : n.modified,
    owner: n.owner,
    publication_date: typeof n.publication_date === 'string' ? moment(n.publication_date) : n.publication_date,
    shared: n.shared,
    status: n.status,
    thread_icon: n.thread_icon,
    thread_id: n.thread_id,
    thread_title: n.thread_title,
    title: n.title,
    username: n.username,
    _id: n._id,
  };
  return ret as INews;
};

export const newsUriCaptureFunction: IResourceUriCaptureFunction<{ threadId: string; infoId: string }> = url => {
  const newsThreadRegex = /^\/actualites.+\/thread\/(\d+)/;
  const newsInfoRegex = /^\/actualites.+\/info\/(\d+)/;
  return {
    threadId: url.match(newsThreadRegex)?.[1],
    infoId: url.match(newsInfoRegex)?.[1],
  };
};

export const newsService = {
  get: async (session: ISession, newsId: { threadId: string; infoId: string }) => {
    const { threadId, infoId } = newsId;
    const api = `/actualites/thread/${threadId}/info/${infoId}`;
    const entcoreNews = (await fetchJSONWithCache(api)) as IEntcoreNews;
    // Run the news adapter for the received news
    return newsAdapter(entcoreNews) as INews;
  },
};
