import type { AudienceRect } from '~/modules/audience/model';

export interface ReactionPickerProps {
  /** Where the react button is, in the coordinates of the window: the picker is shown above it. */
  anchor: AudienceRect | undefined;
  /** The reactions leave (the picker is about to close). */
  closing: boolean;
  /** The reaction under the finger, zoomed. */
  hoveredReaction: string | undefined;
  /** A press out of the reactions, or the back button (Android): the picker closes with its animations. */
  onClose: () => void;
  /** The screen was left (navigation to another screen): the `Modal` is already hiding, the picker closes at once. */
  onDismiss: () => void;
  /** The reactions have left (`closing`): the picker can be hidden (`visible`). */
  onHidden: () => void;
  onPick: (reaction: string) => void;
  reactionTypes: string[];
  visible: boolean;
}
