import { AccountType } from '~/framework/modules/auth/model';

export interface BlogPostViewer {
  counter: number;
  profile: AccountType;
}

export interface BlogPostViews {
  uniqueViewsCounter: number;
  uniqueViewsPerProfile: BlogPostViewer[];
  viewsCounter: number;
}
