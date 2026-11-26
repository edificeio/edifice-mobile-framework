/**
 * List of the pages of a wiki, opened from the reader (button « choose a page »): a sheet that gives back the page chosen. The reader
 * then shows it in its place.
 */
import * as React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { defineModal, type ScreenPromiseParams, useScreenPromise } from '~/app/navigation-new';
import { SheetView } from '~/app/navigation-new/layout';
import FlatList from '~/framework/components/list/flat-list';
import { WikiPageList } from '~/framework/modules/wiki/components/page-list';
import type { WikiPageListProps } from '~/framework/modules/wiki/components/page-list/types';
import type { Wiki, WikiPage } from '~/framework/modules/wiki/model';
import { selectWiki } from '~/framework/modules/wiki/store';

type WikiPagesParams = {
  resourceId: Wiki['assetId'];
  /** The page shown by the reader, highlighted in the list. */
  currentPageId: WikiPage['id'];
};

function WikiPagesScreen({ route }: StaticScreenProps<ScreenPromiseParams<WikiPagesParams, WikiPage['id']>>) {
  const { resolve } = useScreenPromise(route);
  const wiki = useSelector(selectWiki(route.params.resourceId));

  const onPressItem = React.useCallback<NonNullable<WikiPageListProps['onPressItem']>>(pageId => resolve(pageId), [resolve]);

  if (!wiki) return null;

  return (
    <SheetView>
      <WikiPageList
        borderless={true}
        currentPageId={route.params.currentPageId}
        ListComponent={FlatList}
        onPressItem={onPressItem}
        wikiData={wiki}
      />
    </SheetView>
  );
}

export default defineModal({
  options: () => ({
    headerShown: false,
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
  }),
  screen: WikiPagesScreen,
});
