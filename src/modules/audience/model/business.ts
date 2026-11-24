import type { AudiencePoint, AudienceRect } from '.';

/**
 * The reaction under a point of the screen, in the picker of reactions (one after the other, in a row).
 * The point and the picker are in the same coordinates (the window): the gesture started on the react button goes on over the picker.
 * @param point where the finger is.
 * @param picker where the picker is.
 * @param itemWidth the width of one reaction in the picker.
 * @param reactionTypes the reactions of the picker, in their order.
 * @returns the reaction, or `undefined` out of the picker.
 */
export const getReactionAt = (
  point: AudiencePoint,
  picker: AudienceRect,
  itemWidth: number,
  reactionTypes: readonly string[],
): string | undefined => {
  const isInPicker =
    point.x >= picker.x && point.x <= picker.x + picker.width && point.y >= picker.y && point.y <= picker.y + picker.height;
  if (!isInPicker || itemWidth <= 0) return undefined;
  return reactionTypes[Math.floor((point.x - picker.x) / itemWidth)];
};
