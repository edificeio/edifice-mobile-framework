/**
 * Action types and action creators of `wiki`: what happened, for the reducer. What the user does (load, comment…) is in
 * `~/framework/modules/wiki/actions`.
 */
import type { Wiki, WikiPage } from '~/framework/modules/wiki/model';

// Same values as before the move into `store/` (`WIKI_` + type)
export const wikiActionTypes = {
  pageLoaded: 'WIKI_LOAD_PAGE',
  wikiLoaded: 'WIKI_LOAD_WIKI',
} as const;

export const wikiActions = {
  pageLoaded: (data: WikiPage) => ({ data, type: wikiActionTypes.pageLoaded }),
  wikiLoaded: (data: Wiki) => ({ data, type: wikiActionTypes.wikiLoaded }),
};

export type WikiAction = ReturnType<(typeof wikiActions)[keyof typeof wikiActions]>;
