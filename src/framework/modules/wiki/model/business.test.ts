import { canCommentWiki, canSeeHiddenPages, CREATE_WIKI_RIGHT, hasWikiCreationRights } from './business';

describe('hasWikiCreationRights', () => {
  it('is given by the workflow right of the creation', () => {
    expect(hasWikiCreationRights([{ name: 'other' }, { name: CREATE_WIKI_RIGHT }])).toBe(true);
    expect(hasWikiCreationRights([{ name: 'other' }])).toBe(false);
  });
});

describe('canSeeHiddenPages', () => {
  it('is for the creator and the managers of the wiki', () => {
    expect(canSeeHiddenPages(['creator'])).toBe(true);
    expect(canSeeHiddenPages(['read', 'manager'])).toBe(true);
    expect(canSeeHiddenPages(['read', 'contrib', 'comment'])).toBe(false);
    expect(canSeeHiddenPages([])).toBe(false);
  });
});

describe('canCommentWiki', () => {
  it('is for the users who can comment, and the creator', () => {
    expect(canCommentWiki(['read', 'comment'])).toBe(true);
    expect(canCommentWiki(['creator'])).toBe(true);
    expect(canCommentWiki(['read', 'manager'])).toBe(false);
  });
});
