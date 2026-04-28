import { IAppBadgeInfo } from '~/framework/util/moduleTool';

type MakeUnion<T> = T[keyof T];

export const MyAppsFilterCategories = {
  all: 'toutes',
  communication: 'communication',
  organisation: 'organisation',
  otherServices: 'otherServices',
  pedagogie: 'pedagogie',
} as const;

export type MyAppsCategory = MakeUnion<typeof MyAppsFilterCategories>;

export const MyAppsFilterTypes = {
  Category: 'category',
  Favorites: 'favorites',
  Libraries: 'libraries',
  Search: 'search',
} as const;

export type MyAppsFilter =
  | { type: typeof MyAppsFilterTypes.Category; value: MyAppsCategory }
  | { type: typeof MyAppsFilterTypes.Favorites }
  | { type: typeof MyAppsFilterTypes.Libraries }
  | { type: typeof MyAppsFilterTypes.Search; value: string };

export interface AppsInfoWithCategory extends AppsInfoAggregated {
  resolvedCategory: MyAppsCategory;
}

export interface AppsInfo extends Omit<ApplicationsList, 'casType' | 'scope'>, Partial<Omit<ApplicationsConfig, 'name'>> {
  isMobile: boolean;
  isConnector: boolean;
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
  aggregatedApps: Record<ApplicationsList['name'], AppsInfoAggregated>;
  appsInfo: AppsInfo[];
  appsConfig: ApplicationsConfig[];
  favorites: AppBookmarks;
  showAllApps: boolean;
}

export interface AppsInfoAggregated extends AppsInfo {
  badgeKey: string;
  category?: string;
  color?: string;
  help?: Record<string, string | null>;
  libraries?: string;
  testID: string;
}

export interface ApplicationsListResponse {
  apps: ApplicationsList[];
}

export type AppBadgesType = Record<string, IAppBadgeInfo>;

export interface MyAppsPreferencesStorageData {
  showAllApps: boolean;
}
