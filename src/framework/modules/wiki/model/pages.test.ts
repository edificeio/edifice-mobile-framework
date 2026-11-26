import type { WikiPageMetaData, WikiPageNode } from '~/framework/modules/wiki/model';

import { arrangeWikiPages, getAdjacentPageIds, orderWikiPages } from './pages';

const node = (id: string, position: number, childrenIds: string[] = [], overrides: Partial<WikiPageNode> = {}): WikiPageNode => ({
  childrenIds,
  id,
  isVisible: true,
  parentId: undefined,
  position,
  title: id,
  ...overrides,
});

const idsAndDepths = (pages: WikiPageMetaData[]) => pages.map(({ depth, id }) => [id, depth]);

describe('orderWikiPages', () => {
  it('orders the pages by position, each one followed by its children, with their depth', () => {
    const pages = [
      node('b', 2, ['b2', 'b1']),
      node('a', 1),
      node('b1', 3, [], { parentId: 'b' }),
      node('b2', 4, ['b2a'], { parentId: 'b' }),
      node('b2a', 5, [], { parentId: 'b2' }),
    ];
    // Children are walked in the order of `childrenIds` (by position, from the adapter)
    expect(idsAndDepths(orderWikiPages(pages))).toEqual([
      ['a', 0],
      ['b', 0],
      ['b2', 1],
      ['b2a', 2],
      ['b1', 1],
    ]);
  });

  it('keeps a page where it is met first: a child placed before its parent stays at the top, once', () => {
    const pages = [node('parent', 2, ['child']), node('child', 1, [], { parentId: 'parent' })];
    expect(idsAndDepths(orderWikiPages(pages))).toEqual([
      ['child', 0],
      ['parent', 0],
    ]);
  });

  it('ignores the children the server does not give', () => {
    expect(idsAndDepths(orderWikiPages([node('a', 1, ['missing'])]))).toEqual([['a', 0]]);
  });

  it('does not change the pages it is given', () => {
    const pages = [node('b', 2), node('a', 1)];
    orderWikiPages(pages);
    expect(pages.map(page => page.id)).toEqual(['b', 'a']);
  });
});

describe('arrangeWikiPages', () => {
  const pages = [node('a', 1), node('hidden', 2, [], { isVisible: false }), node('c', 3)];

  it('hides the hidden pages from the users who do not manage the wiki', () => {
    expect(arrangeWikiPages(pages, ['read', 'comment']).map(page => page.id)).toEqual(['a', 'c']);
  });

  it('shows them to its creator and its managers', () => {
    expect(arrangeWikiPages(pages, ['creator']).map(page => page.id)).toEqual(['a', 'hidden', 'c']);
    expect(arrangeWikiPages(pages, ['manager']).map(page => page.id)).toEqual(['a', 'hidden', 'c']);
  });
});

describe('getAdjacentPageIds', () => {
  const pages = orderWikiPages([node('a', 1), node('b', 2), node('c', 3)]);

  it('gives the pages before and after a page', () => {
    expect(getAdjacentPageIds(pages, 'b')).toEqual({ nextId: 'c', previousId: 'a' });
  });

  it('gives none past the ends', () => {
    expect(getAdjacentPageIds(pages, 'a')).toEqual({ nextId: 'b', previousId: undefined });
    expect(getAdjacentPageIds(pages, 'c')).toEqual({ nextId: undefined, previousId: 'b' });
  });

  it('gives none for a page that is not in the list', () => {
    expect(getAdjacentPageIds(pages, 'unknown')).toEqual({ nextId: undefined, previousId: undefined });
  });
});
