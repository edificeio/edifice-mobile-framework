import { MyAppsEmptyScreenConfig } from './types';

import { MyAppsFilter } from '~/framework/modules/myapps/types';

export const EMPTY_SCREEN_CONFIG: MyAppsEmptyScreenConfig = {
  favorites: {
    text: 'myapp-empty-screen-favorite-text',
    title: 'myapp-empty-screen-favorite-title',
  },
  other: {
    text: 'myapp-empty-screen-other-text',
    title: 'myapp-empty-screen-other-title',
  },
  search: {
    text: 'myapp-empty-screen-search-text',
    title: 'myapp-empty-screen-search-title',
  },
};
export const resolveEmptyScreenKey = (filter: MyAppsFilter): keyof MyAppsEmptyScreenConfig => {
  switch (filter.type) {
    case 'favorites':
      return 'favorites';
    case 'search':
      return 'search';
    default:
      return 'other';
  }
};
