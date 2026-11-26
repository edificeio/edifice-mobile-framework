import type { Wiki, WikiPage } from '~/framework/modules/wiki/model';

import type { WikiRootState } from './state';

/** A wiki opened, if it is loaded. */
export const selectWiki = (id: Wiki['assetId']) => (state: WikiRootState) => state.wiki.wikis[id] as Wiki | undefined;

/** A page opened, if it is loaded. */
export const selectPage = (id: WikiPage['id']) => (state: WikiRootState) => state.wiki.pages[id] as WikiPage | undefined;
