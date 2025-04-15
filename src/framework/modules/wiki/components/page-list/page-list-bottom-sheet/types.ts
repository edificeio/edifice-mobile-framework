import { FlatListProps } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';

import { Wiki, WikiPage } from '~/framework/modules/wiki/model';

export interface PageListBottomSheetProps {
  currentPageId?: string;
  ListComponent: typeof FlatList;
  ListFooterComponent?: FlatListProps<Wiki['pages'][0]>['ListFooterComponent'];
  onPress?: (id: WikiPage['id'], reverse?: boolean) => void;
  wikiData: Wiki;
}
