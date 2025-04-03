import { FlatListProps } from 'react-native';

import { Wiki, WikiPage } from '~/framework/modules/wiki/model';

export interface PageListBottomSheetProps {
  currentPageId?: string;
  ListFooterComponent?: FlatListProps<Wiki['pages'][0]>['ListFooterComponent'];
  onPress?: (id: WikiPage['id'], reverse?: boolean) => void;
  wikiData: Wiki;
}
