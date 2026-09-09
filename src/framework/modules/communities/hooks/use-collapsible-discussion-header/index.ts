import * as React from 'react';

import { Extrapolation, interpolate, SharedValue, useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { getScaleWidth } from '~/framework/components/constants';

import { UseCollapsibleDiscussionHeader } from './types';

/** `onLayout` reports fractional dp: skip the re-render when two passes differ only in the decimals. */
const LAYOUT_EPSILON = 1;
/** Scroll distance the morph is spread over, whatever the title's length. */
const COLLAPSE_DISTANCE = getScaleWidth(160);

export function useCollapsibleDiscussionHeader(scrollOffset: SharedValue<number>): UseCollapsibleDiscussionHeader {
  const expandedBandHeightShared = useSharedValue(0);
  const collapsibleHeight = useSharedValue(0);
  const [expandedBandHeight, setExpandedBandHeight] = React.useState(0);

  const onLayoutChange = React.useCallback(
    (nextBandHeight: number, nextCollapsibleHeight: number) => {
      if (Math.abs(collapsibleHeight.value - nextCollapsibleHeight) >= LAYOUT_EPSILON)
        collapsibleHeight.value = nextCollapsibleHeight;
      if (Math.abs(expandedBandHeightShared.value - nextBandHeight) < LAYOUT_EPSILON) return;
      expandedBandHeightShared.value = nextBandHeight;
      setExpandedBandHeight(nextBandHeight);
    },
    [expandedBandHeightShared, collapsibleHeight],
  );

  const progress = useDerivedValue(() => {
    if (!collapsibleHeight.value) return 0;
    return interpolate(scrollOffset.value, [0, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP);
  });

  const collapse = React.useMemo(
    () => ({ bandHeight: expandedBandHeightShared, collapsibleHeight, onLayoutChange, progress }),
    [expandedBandHeightShared, collapsibleHeight, onLayoutChange, progress],
  );

  return { collapse, expandedBandHeight };
}
