import type { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';

export interface FlashMessageListProps {
  flashMessages: IEntcoreFlashMessage[];
  loading: boolean;
  onDismiss: (id: number) => void;
}
