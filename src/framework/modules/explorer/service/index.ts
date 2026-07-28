import { Temporal } from '@js-temporal/polyfill';

import { newEntAppNameFromOldMap } from '~/app/intents';
import type { ExplorerPageData } from '~/framework/modules/explorer/model/types';
import { sessionFetch } from '~/framework/util/transport';

import type { API } from './types';
import { MediaType } from '../../media';

const hydrateFolder = (data: ArrayElement<API.Explorer.ResourcesPageOK['folders']>): ArrayElement<ExplorerPageData['folders']> => ({
  id: data.id,
  title: data.name,
});

const hydrateResource = (
  item: ArrayElement<API.Explorer.ResourcesPageOK['resources']>,
): ArrayElement<ExplorerPageData['resources']> => {
  return {
    appName: newEntAppNameFromOldMap[item.application], // ugly, but API son't send new app names as intented
    date: Temporal.Instant.fromEpochMilliseconds(item.updatedAt),
    id: item.id,
    name: item.name,
    resourceId: item.assetId,
    src: '', // No src provided
    thumbnail: item.thumbnail,
    type: MediaType.RESOURCE,
  };
};

const hydrateResources = (data: API.Explorer.ResourcesPageOK): ExplorerPageData => ({
  folders: data.folders.map(hydrateFolder),
  pagination: {
    pageSize: data.pagination.pageSize,
    pageStart: data.pagination.startIdx,
    total: data.pagination.maxIdx,
  },
  resources: data.resources.map(hydrateResource),
});

export default {
  resources: {
    get: async (opts: API.Explorer.ResourcesPageQuery) => {
      try {
        const rawData = await sessionFetch.json<API.Explorer.ResourcesPageOK>(
          `/explorer/resources?${new URLSearchParams(Object.entries(opts))}`,
        );
        return hydrateResources(rawData);
      } catch (e) {
        throw e;
      }
    },
  },
};
