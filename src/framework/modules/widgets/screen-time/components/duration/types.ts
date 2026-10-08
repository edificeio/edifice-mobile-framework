import type { ScreenTimeDayResponse } from '~/framework/modules/widgets/screen-time/model';

export interface ScreenTimeDurationProps {
  isLoadingValues?: boolean;
  today?: ScreenTimeDayResponse;
  yesterday?: ScreenTimeDayResponse;
}
