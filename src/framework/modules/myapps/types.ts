import { IEntcoreApp } from '~/framework/util/moduleTool';

export type MyAppsCategories = 'communication' | 'pedagogie' | 'organisation' | 'servicesExternes' | 'toutes';

export type MyAppsFilter = { type: 'category'; value: MyAppsCategories } | { type: 'favorites' };

export interface AppsInfoWithCategory extends AppsInfoAggregated {
  resolvedCategory: MyAppsCategories;
}

export type AppType = 'application' | 'connector';

export interface AppsInfo extends Partial<Omit<ApplicationsConfig, 'name'>> {
  name: string;
  displayName: string;
  display: boolean;
  address: string;
  target?: string;
  prefix?: string;
  icon?: string;
  type: AppType;
  isMobile: boolean;
  isFavorite: boolean;
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
  entcoreApps: IEntcoreApp[];
  loading: boolean;
  error?: string;
}

export interface AppsInfoActionPayloads {
  fetchStart: undefined;
  fetchSuccess: {
    appsInfo: AppsInfo[];
    appsConfig: ApplicationsConfig[];
    entcoreApps: IEntcoreApp[];
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
