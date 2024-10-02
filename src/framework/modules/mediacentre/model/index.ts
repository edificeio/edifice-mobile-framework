export enum Source {
  GAR = 'fr.openent.mediacentre.source.GAR',
  MOODLE = 'fr.openent.mediacentre.source.Moodle',
  SIGNET = 'fr.openent.mediacentre.source.Signet',
}

export type Resource = {
  authors: string | string[];
  editors: string[];
  id: string;
  image: string;
  levels: string[];
  link: string;
  source: Source;
  title: string;
  types: string[];
  uid: string;
  pinned_description?: string;
};

export type MediacentreResources = {
  externals: Resource[];
  pins: Resource[];
  signets: Resource[];
  textbooks: Resource[];
};

export enum SectionType {
  EXTERNAL_RESOURCES = 'externalresources',
  FAVORITES = 'favorites',
  PINS = 'pins',
  SIGNETS = 'signets',
  TEXTBOOKS = 'textbooks',
}
