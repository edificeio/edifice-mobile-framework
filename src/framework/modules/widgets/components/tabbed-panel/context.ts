import { createContext, useContext } from 'react';

import type { TabLayout } from './types';

export interface TabbedPanelContextValue {
  setTab: (layout?: TabLayout) => void;
}

const TabbedPanelContext = createContext<TabbedPanelContextValue | undefined>(undefined);

export const TabbedPanelProvider = TabbedPanelContext.Provider;

/**
 * For a row of tabs to reach the panel it stands on. Undefined outside of one, which is a valid
 * case: the row then simply has no shape to raise.
 */
export const useTabbedPanel = () => useContext(TabbedPanelContext);
