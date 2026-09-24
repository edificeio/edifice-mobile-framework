import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { HomeNewsItem } from '~/framework/modules/news/components/home-section/types';

export interface NewsSectionProps {
  news: HomeNewsItem[];
  loading: boolean;
  session: AuthActiveAccount;
  onPressItem: (item: HomeNewsItem) => void;
  onSeeMore: () => void;
}
