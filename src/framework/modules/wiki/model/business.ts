/**
 * Rights of the user in `wiki`: create a wiki, see the hidden pages, comment.
 * The rights of the user on a wiki are the ones given by `computeRights` (`Wiki.rights`).
 */

/** Workflow right that creates a wiki. */
export const CREATE_WIKI_RIGHT = 'net.atos.entng.wiki.controllers.WikiController|createWiki';

/** Rights on a wiki that show its hidden pages. Rule of the app: it should be done by the backend. */
const RIGHTS_THAT_SEE_HIDDEN_PAGES = ['creator', 'manager'];

/** Rights on a wiki that allow to comment its pages. */
const RIGHTS_THAT_COMMENT = ['comment', 'creator'];

/** Whether the user can create a wiki: he has its workflow right (`authorizedActions` of the session). */
export const hasWikiCreationRights = (authorizedActions: readonly { name: string }[]): boolean =>
  authorizedActions.some(action => action.name === CREATE_WIKI_RIGHT);

/** Whether the user sees the hidden pages of a wiki. */
export const canSeeHiddenPages = (rights: readonly string[]): boolean =>
  rights.some(right => RIGHTS_THAT_SEE_HIDDEN_PAGES.includes(right));

/** Whether the user can comment the pages of a wiki. */
export const canCommentWiki = (rights: readonly string[]): boolean => rights.some(right => RIGHTS_THAT_COMMENT.includes(right));
