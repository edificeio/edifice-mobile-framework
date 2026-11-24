export interface AudienceReactButtonProps {
  onDeleteReaction: () => void;
  onPostReaction: (reaction: string) => void;
  onUpdateReaction: (reaction: string) => void;
  /** The reactions of the picker: the valid reaction types of the platform. */
  reactionTypes: string[];
  userReaction: string | null;
}
