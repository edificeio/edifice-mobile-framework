import { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';

export interface ITimelineFlashMessageProps {
  flashMessage: IEntcoreFlashMessage;
  flashMessageAction: () => void;
}

export interface ITimelineFlashMessageState {
  expandable: boolean | undefined;
  expanded: boolean;
}
