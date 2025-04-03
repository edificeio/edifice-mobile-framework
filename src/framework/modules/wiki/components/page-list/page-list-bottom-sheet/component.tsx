import * as React from 'react';

import { PageList } from '../component';
import { PageListBottomSheetProps } from './types';

import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';

const PageListBottomSheet = React.forwardRef<BottomSheetModalMethods, PageListBottomSheetProps>(
  ({ currentPageId, ListFooterComponent, onPress, wikiData }, ref) => {
    const hidePagesBottomSheet = React.useCallback(() => {
      (ref as React.RefObject<BottomSheetModalMethods>)?.current?.dismiss();
    }, [ref]);

    return (
      <BottomSheetModal ref={ref} onDismiss={hidePagesBottomSheet}>
        <PageList
          borderless={true}
          currentPageId={currentPageId}
          ListFooterComponent={ListFooterComponent}
          onPressItem={onPress}
          wikiData={wikiData}
        />
      </BottomSheetModal>
    );
  },
);

export default PageListBottomSheet;
