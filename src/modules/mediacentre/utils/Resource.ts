export enum Source {
  GAR = 'fr.openent.mediacentre.source.GAR',
  Moodle = 'fr.openent.mediacentre.source.Moodle',
  PMB = 'fr.openent.mediacentre.source.PMB',
  Signet = 'fr.openent.mediacentre.source.Signet',
}

export interface Resource {
  id: string;
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
  structure_name?: string;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
}
