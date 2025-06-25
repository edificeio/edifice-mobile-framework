import * as React from 'react';

import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageList } from '~/framework/modules/wiki/components/page-list/component';
import { PageListBottomSheetProps } from '~/framework/modules/wiki/components/page-list/page-list-bottom-sheet/types';

const PageListBottomSheet = React.forwardRef<BottomSheetModalMethods, PageListBottomSheetProps>(
  ({ additionalTopInset, currentPageId, ListComponent, ListFooterComponent, onPress, wikiData }, ref) => {
    const hidePagesBottomSheet = React.useCallback(() => {
      (ref as React.RefObject<BottomSheetModalMethods>)?.current?.dismiss();
    }, [ref]);

    return (
      <BottomSheetModal additionalTopInset={additionalTopInset} ref={ref} onDismiss={hidePagesBottomSheet} style={false}>
        <PageList
          borderless={true}
          currentPageId={currentPageId}
          ListComponent={ListComponent}
          ListFooterComponent={ListFooterComponent}
          onPressItem={onPress}
          wikiData={wikiData}
        />
      </BottomSheetModal>
    );
  },
);

export default PageListBottomSheet;
