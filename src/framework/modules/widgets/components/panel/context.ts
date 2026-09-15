import { createContext, useContext } from 'react';

import type { TabLayout } from './types';

export interface PanelContextValue {
  setTab: (layout?: TabLayout) => void;
}

const PanelContext = createContext<PanelContextValue | undefined>(undefined);

export const PanelProvider = PanelContext.Provider;

/**
 * For a row of tabs to reach the panel it stands on. Undefined outside of one, which is a valid
 * case: the row then simply has no shape to raise.
 */
export const useTabbedPanel = () => useContext(PanelContext);
