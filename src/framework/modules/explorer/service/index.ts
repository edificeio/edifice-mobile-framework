import { Temporal } from '@js-temporal/polyfill';

import type { ExplorerApp, ExplorerPageData } from '~/framework/modules/explorer/model/types';
import { MediaType } from '~/framework/modules/media/types';
import { sessionFetch } from '~/framework/util/transport';

import type { API } from './types';

// Backend does not always provide timestamps, and does not always provide them as an epoch in ms.
// If date isn't provided, render without it instead of throwing
const hydrateTimestamp = (timestamp: unknown): Temporal.Instant | undefined => {
  if (timestamp === undefined || timestamp === null || timestamp === '') return undefined;
  const epochMilliseconds = Number(timestamp);
  if (Number.isFinite(epochMilliseconds)) return Temporal.Instant.fromEpochMilliseconds(Math.trunc(epochMilliseconds));
  if (typeof timestamp === 'string') {
    try {
      return Temporal.Instant.from(timestamp);
    } catch {
      return undefined;
    }
  }
  return undefined;
};

// The API names the apps by their legacy name (`application`), not by the `name` of their `EntApp`: the explorer converts them here,
// right after the API that imposes them, and only knows the `EntApp` names elsewhere. An app the explorer shows needs a line here.
const explorerAppFromEntApplication: { [application: string]: ExplorerApp | undefined } = {
  blog: 'Blog',
  homeworks: 'Cahier de texte',
  scrapbook: 'Cahier Multimédia',
  wiki: 'Wiki',
};

/** The app (`name` of its `EntApp`) of an `application` of the API: the explorer keeps its data by app under this name. */
export const toExplorerApp = (application: string): ExplorerApp | undefined => explorerAppFromEntApplication[application];

const hydrateFolder = (data: ArrayElement<API.Explorer.ResourcesPageOK['folders']>): ArrayElement<ExplorerPageData['folders']> => ({
  id: data.id,
  title: data.name,
});

const hydrateResource = (
  item: ArrayElement<API.Explorer.ResourcesPageOK['resources']>,
): ArrayElement<ExplorerPageData['resources']> => {
  return {
    // ugly, but API son't send new app names as intented
    // ToDo(explorer-migration): undefined for an application without a known app, as before (the cast keeps `appName` a `string`)
    appName: toExplorerApp(item.application) as string,
    date: hydrateTimestamp(item.updatedAt ?? item.createdAt),
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
    /** A page of a folder, with the app it belongs to (converted from `application`): the explorer keeps its data by app. */
    get: async (opts: API.Explorer.ResourcesPageQuery): Promise<ExplorerPageData & { app: ExplorerApp }> => {
      // The data is kept by app: an application without a known app can't be loaded
      const app = toExplorerApp(opts.application);
      if (!app) throw new Error(`[Explorer] No app for the application "${opts.application}"`);
      try {
        const rawData = await sessionFetch.json<API.Explorer.ResourcesPageOK>(
          `/explorer/resources?${new URLSearchParams(Object.entries(opts))}`,
        );
        return { app, ...hydrateResources(rawData) };
      } catch (e) {
        throw e;
      }
    },
  },
};
