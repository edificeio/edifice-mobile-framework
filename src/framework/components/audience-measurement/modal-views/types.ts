import { AudienceViewer } from '~/framework/modules/core/audience/types';

export interface AudienceMeasurementViewsModalProps {
  nbUniqueViews: number;
  nbViews: number;
  viewsPerProfile: AudienceViewer[];
}
