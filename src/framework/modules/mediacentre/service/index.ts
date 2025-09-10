import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { IField, ISources } from '~/framework/modules/mediacentre/components/AdvancedSearchModal';
import { IResource, IResourceList, Source } from '~/framework/modules/mediacentre/reducer';
import { openUrl } from '~/framework/util/linking';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

interface IBackendResource {
  id: string;
  _id?: string;
  title: string;
  plain_text: string;
  image: string;
  document_types?: string[];
  source?: Source;
  link?: string;
  url?: string;
  authors: string[];
  editors: string[];
  disciplines: string[];
  levels: string[];
  user: string;
  favorite?: boolean;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
  owner_name?: string;
}

type IBackendResourceList = IBackendResource[];

export function compareResources(a: IResource, b: IResource) {
  return a.title.localeCompare(b.title);
}

function transformArray(array: string[]) {
  array = array.map(value => (Array.isArray(value) && value.length > 1 ? value[1] : value));
  return array;
}

const resourcesAdapter: (data: IBackendResourceList) => IResourceList = data => {
  const resources = [] as IResource[];
  for (const resource of data) {
    const id = resource.source === Source.SIGNET ? resource.id : (resource._id ?? resource.id);
    const res = {
      id,
      uid: resource.structure_uai ? resource.id + resource.structure_uai : id,
      title: resource.title,
      plain_text: resource.plain_text,
      image: resource.image,
      types: resource.document_types || ['livre numérique'],
      source: resource.source || Source.SIGNET,
      link: resource.link || resource.url,
      authors: resource.owner_name || resource.authors,
      editors: resource.editors,
      disciplines: resource.disciplines,
      levels: transformArray(resource.levels),
      user: resource.user,
      favorite: resource.favorite,
      structure_uai: resource.structure_uai,
      orientation: resource.orientation,
      owner_id: resource.owner_id,
    } as IResource;
    resources.push(res);
  }
  return resources.sort(compareResources);
};

const concatResources = (response: any) => {
  let resources: any[] = [];
  for (const res of response) {
    if (res.data && res.data.resources) {
      resources = resources.concat(res.data.resources);
    }
  }
  return resources;
};

const addFieldWhenFilled = (field: IField) => {
  return { value: field.value, comparator: field.operand ? '$and' : '$or' };
};

const addSource = (sources: string[], value: boolean, name: string) => {
  if (value) {
    sources.push(`fr.openent.mediacentre.source.${name}`);
  }
};

export const mediacentreService = {
  favorites: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/favorites';
      const res = await fetchJSONWithCache(api);
      if (!Array.isArray(res.data)) return [];
      const favorites = resourcesAdapter(res.data);
      for (const resource of favorites) {
        resource.favorite = true;
      }
      return favorites;
    },
    add: async (session: AuthActiveAccount, id: string, resource: IResource) => {
      const api = `/mediacentre/favorites?id=${id}`;
      const res: any = resource;
      if (resource.source === Source.SIGNET) {
        res.id = Number(resource.id);
      }
      await fetchJSONWithCache(api, {
        method: 'POST',
        body: JSON.stringify(res),
      });
    },
    remove: async (session: AuthActiveAccount, id: string, source: Source) => {
      const api = `/mediacentre/favorites?id=${id}&source=${source}`;
      await fetchJSONWithCache(api, {
        method: 'DELETE',
      });
    },
  },
  search: {
    getSimple: async (session: AuthActiveAccount, sources: string[], query: string) => {
      const jsondata = {
        event: 'search',
        state: 'PLAIN_TEXT',
        sources,
        data: {
          query,
        },
      };
      const api = `/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`;
      const response = await fetchJSONWithCache(api);
      return resourcesAdapter(concatResources(response));
    },
    getAdvanced: async (session: AuthActiveAccount, fields: IField[], checkedSources: ISources) => {
      const sources: string[] = [];
      const jsondata = {
        event: 'search',
        state: 'ADVANCED',
        sources,
        data: {},
      };
      addSource(jsondata.sources, checkedSources.GAR, 'GAR');
      addSource(jsondata.sources, checkedSources.Moodle, 'Moodle');
      addSource(jsondata.sources, checkedSources.PMB, 'PMB');
      addSource(jsondata.sources, checkedSources.Signet, 'Signet');
      for (const field of fields) {
        if (field.value !== '') {
          jsondata.data[field.name] = addFieldWhenFilled(field);
        }
      }
      const api = `/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`;
      const response = await fetchJSONWithCache(api);
      return resourcesAdapter(concatResources(response));
    },
  },
  signets: {
    get: async (session: AuthActiveAccount) => {
      const signetsResponse = await fetchJSONWithCache('/mediacentre/signets');
      const mysignetsResponse = await fetchJSONWithCache('/mediacentre/mysignets');
      return resourcesAdapter(signetsResponse.data.signets.resources)
        .filter(resource => resource.types.includes('Signet'))
        .concat(resourcesAdapter(mysignetsResponse).filter(resource => session.user.id && resource.owner_id !== session.user.id))
        .sort(compareResources);
    },
    getOrientation: async (session: AuthActiveAccount) => {
      const signetsResponse = await fetchJSONWithCache('/mediacentre/signets');
      const mysignetsResponse = await fetchJSONWithCache('/mediacentre/mysignets');
      const resources = resourcesAdapter(signetsResponse.data.signets.resources).filter(resource =>
        resource.types.includes('Orientation'),
      );
      for (const res of resourcesAdapter(mysignetsResponse)) {
        if (res.orientation === true && resources.findIndex(resource => resource.id === String(res.id)) === -1) {
          resources.push(res);
        }
      }
      return resources.sort(compareResources);
    },
    searchSimple: async (session: AuthActiveAccount, query: string) => {
      const api = `/mediacentre/signets/search?query=${query}`;
      const resources = await fetchJSONWithCache(api);
      return resourcesAdapter(resources);
    },
    searchAdvanced: async (session: AuthActiveAccount, fields: IField[]) => {
      const api = '/mediacentre/signets/advanced';
      const body = {};
      for (const field of fields) {
        body[field.name] = { value: field.value, comparator: field.operand ? '$and' : '$or' };
      }
      const resources = (await fetchJSONWithCache(api, {
        method: 'POST',
        body: JSON.stringify(body),
      })) as IBackendResourceList;
      return resourcesAdapter(resources);
    },
  },
  textbooks: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/textbooks';
      const res = await fetchJSONWithCache(api);
      return resourcesAdapter(res.data.textbooks);
    },
  },
};

export const openResource = async (resource: IResource) => {
  if (resource.source === Source.SIGNET) {
    return openUrl(resource.link);
  }
  const session = getSession();
  if (!session) {
    console.debug('[Mediacentre] openResource : No session found');
    return;
  }

  // PEDAGO-3168 — Sometimes the given url already includes the mediacentre open api. Other times it doesn't so we must to manually format it.
  if (resource.link.includes(`${session.platform.url}/mediacentre/resource/open?url=`)) {
    openUrl(resource.link);
  } else {
    openUrl(`/mediacentre/resource/open?url=${encodeURIComponent(resource.link)}`);
  }
};
