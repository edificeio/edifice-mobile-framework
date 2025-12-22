export type AppType = 'mobile' | 'web' | 'connector';

export interface AppsInfo {
  name: string;
  displayName: string;
  display: boolean;
  address: string;
  target?: string;
  prefix?: string;
  icon?: string;
  color?: string;
  type: AppType;
  isFavorite: boolean;
  //see if we gonna use this one
  isPinned: boolean;
}

export interface ApplicationsConfig {
  category: string;
  color: string;
  help: Record<string, string | null>;
  libraries: string;
  name: string;
}

export interface AppBookmarks {
  applications: string[];
  bookmarks: string[];
}
export interface ApplicationsList {
  address: string;
  casType: string | null;
  display: boolean;
  displayName: string;
  icon: string;
  isExternal: boolean;
  name: string;
  prefix: string;
  scope: string[];
  target: string | null;
}

export interface AppsInfoState {
  appsInfo: AppsInfo[];
  appsConfig: ApplicationsConfig[];
  loading: boolean;
  error?: string;
}

export interface AppsInfoActionPayloads {
  fetchStart: undefined;
  fetchSuccess: {
    appsInfo: AppsInfo[];
    appsConfig: ApplicationsConfig[];
  };
  fetchError: {
    error: string;
  };
}
