import type { AudiencePoint, AudienceRect } from '~/modules/audience/model';

export interface AudienceReactButtonProps {
  onDeleteReaction: () => void;
  /** The finger moves, after a touch that started on the button (it may be over the picker of reactions). */
  onGestureMove: (point: AudiencePoint) => void;
  /** The finger left the screen, after a touch that started on the button. */
  onGestureRelease: () => void;
  /**
   * Opens the picker of reactions above the button.
   * @param anchor where the button is.
   * @returns the reaction chosen, or `undefined` if the user chose none.
   */
  onPickReaction: (anchor: AudienceRect) => Promise<string | undefined>;
  onPostReaction: (reaction: string) => void;
  onUpdateReaction: (reaction: string) => void;
  userReaction: string | null;
}
