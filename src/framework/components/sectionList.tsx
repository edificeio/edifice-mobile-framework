import * as React from 'react';
import { SectionList as RNSectionList, SectionListProps as RNSectionListProps, View } from 'react-native';

import { UI_SIZES } from './constants';

export interface SectionListProps<ItemT> extends RNSectionListProps<ItemT> {
  bottomInset?: boolean;
}

function SectionList<ItemT>(props: SectionListProps<ItemT>, ref) {
  const { bottomInset = true, ListFooterComponent, scrollIndicatorInsets, ...otherProps } = props;
  const realListFooterComponent = React.useMemo(() => {
    return bottomInset ? (
      <View style={{ paddingBottom: UI_SIZES.screen.bottomInset }}>{ListFooterComponent}</View>
    ) : (
      ListFooterComponent
    );
  }, [bottomInset, ListFooterComponent]);
  return (
    <RNSectionList
      {...otherProps}
      ref={ref}
      ListFooterComponent={realListFooterComponent}
      scrollIndicatorInsets={scrollIndicatorInsets || SectionList.scrollIndicatorInsets} // 🍎 Hack to guarantee the scrollbar sticks to the right edge of the screen.
    />
  );
}
SectionList.scrollIndicatorInsets = { right: 0.001 };
export default React.forwardRef(SectionList);
