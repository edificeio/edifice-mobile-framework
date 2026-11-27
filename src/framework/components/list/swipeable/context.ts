import * as React from 'react';

import type { SwipeRowsContextValue } from './types';

export const SwipeRowsContext = React.createContext<SwipeRowsContextValue | null>(null);

export const useSwipeRows = (): SwipeRowsContextValue => {
  const swipeRows = React.useContext(SwipeRowsContext);
  if (!swipeRows) throw new Error('useSwipeRows must be used inside a SwipeableFlashList');
  return swipeRows;
};
