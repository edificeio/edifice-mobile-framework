/**
 * State of `wiki` in the redux store: the wikis and the pages opened, by id.
 */
import type { Wiki, WikiPage } from '~/framework/modules/wiki/model';

export interface WikiState {
  /** The wikis opened (summary, reader), by id (`assetId`). */
  wikis: Record<Wiki['assetId'], Wiki>;
  /** The pages opened, by id. */
  pages: Record<WikiPage['id'], WikiPage>;
}

/** What the selectors need of the global state: the reducer is registered under the name of the module. */
export interface WikiRootState {
  wiki: WikiState;
}

export const initialState: WikiState = {
  pages: {},
  wikis: {},
};
