import { createContext, useContext } from 'react';

import type { DaySwipeStyle } from './types';

const DaySwipeContext = createContext<DaySwipeStyle | undefined>(undefined);

export const DaySwipeProvider = DaySwipeContext.Provider;

export const useDaySwipeStyle = () => useContext(DaySwipeContext);
