import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

// Data type of what is given by the backend.

export type IResourceBackend = {
  id: string;
  title: string;
  plain_text: string;
  image: string;
  source?: Source;
  link?: string;
  url?: string;
  authors: string[];
  editors: string[];
  disciplines: string[];
  levels: string[];
  user: string;
  favorite?: boolean;
  structure_name?: string;
  structure_uai?: string;
  orientation?: boolean;
  owner_name?: string;
}[];

export const resourcesAdapter: (data: IResourceBackend) => Resource[] = data => {
  let resources = [] as Resource[];
  if (!data) return resources;
  for (const resource of data) {
    const res = {
      id: resource.structure_uai ? resource.id + resource.structure_uai : resource.id,
      title: resource.title,
      plain_text: resource.plain_text,
      image: resource.image,
      source: resource.source || Source.Signet,
      link: resource.link || resource.url,
      authors: resource.authors,
      editors: resource.editors,
      disciplines: resource.disciplines,
      levels: resource.levels,
      user: resource.user,
      favorite: resource.favorite,
      structure_name: resource.structure_name,
      structure_uai: resource.structure_uai,
      orientation: resource.orientation,
      owner_name: resource.owner_name,
    } as Resource;
    resources.push(res);
  } 
  return resources;
};

export const textbooksService = {
  get: async () => {
    const response = await fetchJSONWithCache(`/mediacentre/textbooks`);
    return resourcesAdapter(response.data.textbooks);
  },
};
