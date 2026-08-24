import type { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';

export interface FlashMessageProps {
  flashMessage: IEntcoreFlashMessage;
  onDismiss: (id: number) => void;
}
