import { Source } from '~/framework/modules/mediacentre/model';

export type BackendResource = {
  id: string | number;
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
  disciplines?: string[] | [number, string][];
  levels: string[] | [number, string][];
  user: string;
  archived?: boolean;
  favorite?: boolean;
  is_textbook?: boolean;
  is_parent?: boolean;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
  owner_name?: string;
  pinned_title?: string;
  pinned_description?: string;
};

export type BackendSearch = {
  event: string;
  state: string;
  status: string;
  data: {
    source: Source;
    resources: BackendResource[];
  };
}[];

export type BackendGlobalResources = {
  event: string;
  state: string;
  status: string;
  data: {
    global: BackendResource[];
  };
};

export type BackendSignetsResourcesType = {
  data: {
    signets: {
      resources: BackendResource[];
    };
  };
};

export type BackendTextBooksType = {
  data: {
    textbooks: BackendResource[];
  };
};
