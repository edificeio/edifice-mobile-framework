import { toReactionBody, toReactionTypes } from './adapter';

describe('toReactionBody', () => {
  it('gives the JSON sent before the move to the adapter', () => {
    const body = toReactionBody({ module: 'blog', resourceId: 'post-1', resourceType: 'post' }, 'REACTION_2');
    expect(JSON.stringify(body)).toBe(JSON.stringify({ reactionType: 'REACTION_2', resourceId: 'post-1' }));
  });
});

describe('toReactionTypes', () => {
  it('gives the reaction types of the conf', () => {
    expect(toReactionTypes({ 'reaction-types': ['REACTION_1', 'REACTION_2'] })).toEqual(['REACTION_1', 'REACTION_2']);
  });
});
