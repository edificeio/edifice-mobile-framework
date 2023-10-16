/**
 * Scrapbook service
 */

import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export const scrapbookService = {
  get: async (id: string) => {
    const api = `/scrapbook/get/${id}`;
    const entcoreScrapbook = (await fetchJSONWithCache(api)) as any;

    return entcoreScrapbook;
  },
};
