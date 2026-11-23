import { svgExists, type SvgIconName } from '~/framework/components/picture';

const isSvgIconName = (name: string): name is SvgIconName => svgExists(name);

/**
 * Icon of a reaction type of the server (`REACTION_1` → `reaction_1`, or `reaction_1-round` for the round one).
 * @returns the icon, or `undefined` if the app has none for this type.
 */
export const getReactionIconName = (reactionType: string, round = false): SvgIconName | undefined => {
  const name = `${reactionType.toLowerCase()}${round ? '-round' : ''}`;
  return isSvgIconName(name) ? name : undefined;
};
