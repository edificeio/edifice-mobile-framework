import type { PropsWithChildren } from 'react';

import type { SvgIconName } from '~/framework/components/picture';

export type WidgetCardProps = PropsWithChildren<{
  title: string;
  onExpand?: () => void;
  expandIcon?: SvgIconName;
  expandTestID?: string;
}>;
