import type { IEntcoreFlashMessage } from '~/framework/modules/home/reducer/flash-messages';

export interface FlashMessageProps {
  flashMessage: IEntcoreFlashMessage;
  onDismiss: (id: number) => void;
}
