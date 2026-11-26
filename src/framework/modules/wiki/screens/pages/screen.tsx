/**
 * List of the pages of a wiki, opened from the reader (button « choose a page »): a sheet that gives back the page chosen. The reader
 * then shows it in its place.
 */
import * as React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { defineModal, type ScreenPromiseParams, SheetView, useScreenPromise, useSheetMaxHeight } from '~/app/navigation-new';
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

  // As high as the pages, then the list scrolls (`useSheetMaxHeight`)
  const sheetMaxHeight = useSheetMaxHeight();
  const sheetStyle = React.useMemo(() => ({ maxHeight: sheetMaxHeight }), [sheetMaxHeight]);

  if (!wiki) return null;

  return (
    <SheetView style={sheetStyle}>
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
