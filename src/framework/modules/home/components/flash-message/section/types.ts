import type { IEntcoreFlashMessage } from '~/framework/modules/home/reducer/flash-messages';

export interface FlashMessageSectionProps {
  flashMessages: IEntcoreFlashMessage[];
  loading: boolean;
  onDismiss: (id: number) => void;
}
