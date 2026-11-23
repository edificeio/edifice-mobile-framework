import { getReactionAt } from './business';

describe('getReactionAt', () => {
  const picker = { height: 50, width: 160, x: 100, y: 200 };
  const reactionTypes = ['REACTION_1', 'REACTION_2', 'REACTION_3', 'REACTION_4'];

  it('gives the reaction under the point', () => {
    expect(getReactionAt({ x: 100, y: 200 }, picker, 40, reactionTypes)).toBe('REACTION_1');
    expect(getReactionAt({ x: 139, y: 225 }, picker, 40, reactionTypes)).toBe('REACTION_1');
    expect(getReactionAt({ x: 140, y: 225 }, picker, 40, reactionTypes)).toBe('REACTION_2');
    expect(getReactionAt({ x: 259, y: 250 }, picker, 40, reactionTypes)).toBe('REACTION_4');
  });

  it('gives nothing out of the picker', () => {
    expect(getReactionAt({ x: 99, y: 225 }, picker, 40, reactionTypes)).toBeUndefined();
    expect(getReactionAt({ x: 150, y: 199 }, picker, 40, reactionTypes)).toBeUndefined();
    expect(getReactionAt({ x: 150, y: 251 }, picker, 40, reactionTypes)).toBeUndefined();
    expect(getReactionAt({ x: 261, y: 225 }, picker, 40, reactionTypes)).toBeUndefined();
  });

  it('gives nothing past the last reaction (border of the picker)', () => {
    expect(getReactionAt({ x: 260, y: 225 }, { ...picker, width: 162 }, 40, reactionTypes)).toBeUndefined();
  });

  it('gives nothing without reactions or width', () => {
    expect(getReactionAt({ x: 120, y: 225 }, picker, 40, [])).toBeUndefined();
    expect(getReactionAt({ x: 120, y: 225 }, picker, 0, reactionTypes)).toBeUndefined();
  });
});
