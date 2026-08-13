import type { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';

export interface FlashMessageListProps {
  flashMessages: IEntcoreFlashMessage[];
  onDismiss: (id: number) => void;
}
