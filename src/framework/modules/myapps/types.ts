import { IEntcoreApp } from '~/framework/util/moduleTool';

export type MyAppsCategories = 'communication' | 'pedagogie' | 'organisation' | 'servicesExternes' | 'toutes';

export type MyAppsFilter =
  | { type: 'category'; value: MyAppsCategories }
  | { type: 'favorites' }
  | { type: 'libraries' }
  | { type: 'search'; value: string };

export interface AppsInfoWithCategory extends AppsInfoAggregated {
  resolvedCategory: MyAppsCategories;
}

export interface AppsInfo extends Omit<ApplicationsList, 'casType' | 'scope'>, Partial<Omit<ApplicationsConfig, 'name'>> {
  isMobile: boolean;
  isFavorite: boolean;
  isLibrary?: boolean;
  routeName?: string;
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
  favorites: AppBookmarks;
  loading: boolean;
  error?: string;
  showAllApps: boolean;
  isSavingFavorites?: boolean;
}

export interface AppsInfoActionPayloads {
  fetchStart: undefined;
  fetchSuccess: {
    appsInfo: AppsInfo[];
    appsConfig: ApplicationsConfig[];
    entcoreApps: IEntcoreApp[];
    favorites: AppBookmarks;
  };
  fetchError: {
    error: string;
  };
}

export interface AppsInfoAggregated extends AppsInfo {
  category?: string;
  color?: string;
  help?: Record<string, string | null>;
  libraries?: string;
}
