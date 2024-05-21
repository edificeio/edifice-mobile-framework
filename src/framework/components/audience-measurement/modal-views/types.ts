import { BlogPostViewer } from '~/framework/modules/blog/model';

export interface AudienceMeasurementViewsModalProps {
  nbUniqueViews: number;
  nbViews: number;
  viewsPerProfile: BlogPostViewer[];
}
