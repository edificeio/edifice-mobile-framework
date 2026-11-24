import type * as React from 'react';

import type { RichContentSegment, RichContentSegmentType } from '~/framework/components/inputs/rich-text/native-viewer/types';

export interface TableProps {
  // Cells content is rendered by the viewer, like the children of a pane
  renderCellContent: (segments: RichContentSegment[], isHeader: boolean) => React.ReactNode;
  segment: Extract<RichContentSegment, { type: RichContentSegmentType.TABLE }>;
}
