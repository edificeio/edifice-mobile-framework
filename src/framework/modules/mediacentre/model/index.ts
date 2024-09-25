export enum Source {
  GAR = 'fr.openent.mediacentre.source.GAR',
  MOODLE = 'fr.openent.mediacentre.source.Moodle',
  SIGNET = 'fr.openent.mediacentre.source.Signet',
}

export type Resource = {
  id: string;
  uid?: string;
  title: string;
  plain_text: string;
  image: string;
  types: string[];
  source: Source;
  link: string;
  authors: string[];
  editors: string[];
  disciplines: string[];
  levels: string[];
  user: string;
  favorite?: boolean;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
};

export type MediacentreResources = {
  externals: Resource[];
  favorites: Resource[];
  signets: Resource[];
  textbooks: Resource[];
};
