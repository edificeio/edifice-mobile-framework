import { FlatListProps } from 'react-native';

import type { Wiki, WikiPage, WikiPageMetaData } from '~/framework/modules/wiki/model';

export interface WikiListItemProps {
  borderless?: boolean;
  childrenIds: string[];
  currentPageId?: string;
  depth: number;
  id: string;
  isVisible: boolean;
  name: string;
  onPressItem?: (pageId: WikiPageMetaData['id']) => void;
  parentId?: string;
  position: number;
  wikiData: Pick<Wiki, 'pages'>;
}

export interface PageListProps {
  borderless?: boolean;
  currentPageId?: string;
  ListFooterComponent?: FlatListProps<Wiki['pages'][0]>['ListFooterComponent'];
  ListHeaderComponent?: FlatListProps<Wiki['pages'][0]>['ListHeaderComponent'];
  onPressItem?: (pageId: WikiPageMetaData['id']) => void;
  refreshControl?: FlatListProps<WikiPage>['refreshControl'];
  wikiData: Pick<Wiki, 'pages'>;
}
