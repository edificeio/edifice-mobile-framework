/**
 * Pages of a wiki: their order in the tree of the wiki, the hidden ones, and the pages before and after a page.
 * Rules of the app: the server gives the pages unordered, each with its children.
 */
import type { WikiPageMetaData, WikiPageNode } from '~/framework/modules/wiki/model';

import { canSeeHiddenPages } from './business';

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

/**
 * Orders the pages as the tree of the wiki, with their depth: the pages by position, each one followed by its children (by position,
 * and so on). A page goes where it is met first, and only once: a child placed before its parent by position is met first among the
 * pages of the top (depth 0), and is not repeated under its parent. Kept as the app always did.
 */
export const orderWikiPages = (pages: readonly WikiPageNode[]): WikiPageMetaData[] => {
  const pagesById = new Map(pages.map(page => [page.id, page]));
  const ordered = new Map<WikiPageNode['id'], WikiPageMetaData>();

  const addPage = (page: WikiPageNode | undefined, depth: number) => {
    if (!page) return;
    if (!ordered.has(page.id)) ordered.set(page.id, { ...page, depth });
    for (const childId of page.childrenIds) addPage(pagesById.get(childId), depth + 1);
  };

  for (const page of [...pages].sort(byPosition)) addPage(page, 0);
  return [...ordered.values()];
};

/** The pages of a wiki as the user sees them: in the order of the tree, without the hidden ones unless his rights show them. */
export const arrangeWikiPages = (pages: readonly WikiPageNode[], rights: readonly string[]): WikiPageMetaData[] => {
  const ordered = orderWikiPages(pages);
  return canSeeHiddenPages(rights) ? ordered : ordered.filter(page => page.isVisible);
};

/** The pages before and after a page, in the order of the tree (buttons « previous » and « next » of the reader). */
export const getAdjacentPageIds = (pages: readonly WikiPageMetaData[], pageId: WikiPageMetaData['id']) => {
  const index = pages.findIndex(page => page.id === pageId);
  return {
    nextId: index !== -1 ? pages.at(index + 1)?.id : undefined,
    previousId: index > 0 ? pages.at(index - 1)?.id : undefined,
  };
};
