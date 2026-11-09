import type * as React from 'react';

import type { RichContentPaneType } from '~/framework/components/inputs/rich-text/native-viewer/types';

export interface PaneProps {
  children: React.ReactNode;
  type: RichContentPaneType;
}
