import { Temporal } from '@js-temporal/polyfill';

import type { API } from './types';

import type { EntAppNameOrSynonym } from '~/app/intents';
import type { ExplorerPageData } from '~/framework/modules/explorer/model/types';
import { sessionFetch } from '~/framework/util/transport';

const hydrateFolder = (data: ArrayElement<API.Explorer.ResourcesPageOK['folders']>): ArrayElement<ExplorerPageData['folders']> => ({
  id: data.id,
  title: data.name,
});

const hydrateResource = (
  data: ArrayElement<API.Explorer.ResourcesPageOK['resources']>,
): ArrayElement<ExplorerPageData['resources']> => ({
  appName: data.application as Exclude<EntAppNameOrSynonym, 'workspace'>,
  date: Temporal.Instant.fromEpochMilliseconds(data.updatedAt),
  id: data.id,
  resourceEntId: data.assetId,
  thumbnail: data.thumbnail,
  title: data.name,
  url: '', // ToDo
});

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
