/**
 * Scrapbook service
 */

import { ScrapbookItem } from '~/framework/modules/scrapbook/model';
import { sessionFetch } from '~/framework/util/transport';

export interface BackendScrapbookItem {
  _id: string;
  title: string;
  trashed: number;
  name: string;
  created: { $date: number };
  modified: { $date: number };
  owner: { userId: string; displayName: string };
  icon: string;
  pageOrder: string[];
  version: number;
  shared: any[];
}

export const scrapbookItemAdapter = (n: BackendScrapbookItem) => {
  const ret = {
    id: n._id,
    owner: {
      displayName: n.owner.displayName,
      userId: n.owner.userId,
    },
    thumbnail: n.icon,
    title: n.title,
    trashed: n.trashed,
  };
  return ret as ScrapbookItem;
};

export const getResourceUri = (id: string) => `/scrapbook/get/${id}`;

export const scrapbookService = {
  get: async (id: string) => {
    const api = getResourceUri(id);
    const entcoreScrapbook = await sessionFetch.json<any>(api);

    return entcoreScrapbook;
  },
  list: async () => {
    const api = `/scrapbook/list/all`;
    const backendScrapbooks = await sessionFetch.json<BackendScrapbookItem[]>(api);
    const scrapbooks: ScrapbookItem[] = [];

    backendScrapbooks.forEach(scrapbook => {
      if (scrapbook.trashed !== 1) scrapbooks.push(scrapbookItemAdapter(scrapbook));
    });

    const finalScrapbooks = scrapbooks.sort((a, b) => {
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });

    return finalScrapbooks as ScrapbookItem[];
  },
};
