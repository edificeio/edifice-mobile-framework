import { MyAppsEmptyScreenConfig } from './types';

import { I18n } from '~/app/i18n';
import { MyAppsFilter } from '~/framework/modules/myapps/types';
import { openUrl } from '~/framework/util/linking';

export const EMPTY_SCREEN_CONFIG: MyAppsEmptyScreenConfig = {
  favorites: {
    testID: 'myapps-empty-favorites',
    text: 'myapp-empty-screen-favorite-text',
    title: 'myapp-empty-screen-favorite-title',
  },
  other: {
    testID: 'myapps-empty-other',
    text: 'myapp-empty-screen-other-text',
    title: 'myapp-empty-screen-other-title',
  },
  search: {
    testID: 'myapps-empty-search',
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

type HelpLinks = Record<string, string | null>;

const FALLBACK_LANG = 'fr';

export const openHelpLink = (links: HelpLinks | undefined) => {
  if (!links) {
    console.warn('[HELP] No help links provided');
    return;
  }

  const lang = I18n.getLanguage();
  const currentItemLang = links[lang];

  if (currentItemLang) {
    openUrl(currentItemLang);
    return;
  }

  const baseLang = lang.split('-')[0];
  if (links[baseLang]) {
    openUrl(links[baseLang]);
    return;
  }

  if (links[FALLBACK_LANG]) {
    openUrl(links[FALLBACK_LANG]);
    return;
  }

  console.warn('[HELP] No matching help URL for lang:', lang);
};
