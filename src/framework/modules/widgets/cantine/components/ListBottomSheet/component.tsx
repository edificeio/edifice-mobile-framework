import * as React from 'react';

import List from '../List';
import { ListBottomSheetProps } from './types';

import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';

const ListBottomSheet = React.forwardRef<BottomSheetModalMethods, ListBottomSheetProps>(
  ({ ListComponent, ListFooterComponent, onPress, structuresData }, ref) => {
    const hideListBottomSheet = React.useCallback(() => {
      (ref as React.RefObject<BottomSheetModalMethods>)?.current?.dismiss();
    }, [ref]);

    return (
      <BottomSheetModal ref={ref} onDismiss={hideListBottomSheet} style={false}>
        <List
          borderless={true}
          ListComponent={ListComponent}
          ListFooterComponent={ListFooterComponent}
          onPressItem={onPress}
          structuresData={structuresData}
        />
      </BottomSheetModal>
    );
  },
);

export default ListBottomSheet;
