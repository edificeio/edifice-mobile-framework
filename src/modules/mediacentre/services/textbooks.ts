import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

// Data type of what is given by the backend.

export type IResourceBackend = {
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
  owner_id?: string;
  owner_name?: string;
}[];

export function compareResources(a: Resource, b: Resource) {
  if (a.title < b.title) {
    return -1;
  } else if (a.title > b.title) {
    return 1;
  }
  return 0;
}

export const resourcesAdapter: (data: IResourceBackend) => Resource[] = data => {
  const resources = [] as Resource[];
  if (!data) return resources;
  for (const resource of data) {
    const res = {
      id: resource.id,
      uid: resource.structure_uai ? resource.id + resource.structure_uai : resource._id,
      title: resource.title,
      plain_text: resource.plain_text,
      image: resource.image,
      types: resource.document_types || ['livre numérique'],
      source: resource.source || Source.Signet,
      link: resource.link || resource.url,
      authors: resource.owner_name || resource.authors,
      editors: resource.editors,
      disciplines: resource.disciplines,
      levels: resource.levels,
      user: resource.user,
      favorite: resource.favorite,
      structure_uai: resource.structure_uai,
      owner_id: resource.owner_id,
    } as Resource;
    resources.push(res);
  }
  return resources.sort(compareResources);
};

export const textbooksService = {
  get: async () => {
    const response = await fetchJSONWithCache(`/mediacentre/textbooks`);
    return resourcesAdapter(response.data.textbooks);
  },
};
