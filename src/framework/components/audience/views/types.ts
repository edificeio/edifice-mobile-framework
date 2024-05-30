import { AudienceViewer } from '~/framework/modules/core/audience/types';

export interface AudienceViewsModalProps {
  nbUniqueViews: number;
  nbViews: number;
  viewsPerProfile: AudienceViewer[];
}
