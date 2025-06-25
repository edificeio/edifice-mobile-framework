import { FlatListProps } from 'react-native';

import { FlatList as RNFlatlist } from 'react-native-gesture-handler';

import FlatList from '~/framework/components/list/flat-list';
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
  index: number;
}

export interface PageListProps {
  borderless?: boolean;
  currentPageId?: string;
  ListComponent: typeof FlatList | typeof RNFlatlist;
  ListFooterComponent?: FlatListProps<Wiki['pages'][0]>['ListFooterComponent'];
  ListHeaderComponent?: FlatListProps<Wiki['pages'][0]>['ListHeaderComponent'];
  onPressItem?: (pageId: WikiPageMetaData['id']) => void;
  refreshControl?: FlatListProps<WikiPage>['refreshControl'];
  wikiData: Pick<Wiki, 'pages'>;
  ListEmptyComponent?: FlatListProps<Wiki['pages'][0]>['ListEmptyComponent'];
}
