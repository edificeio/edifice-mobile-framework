import * as React from 'react';

import { RichToolbarButton } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-button';

import { RichToolbarPageItemProps } from './types';
import { RichToolbarItem } from '../component';

export const RichToolbarPageItem = (props: RichToolbarPageItemProps) => {
  return <RichToolbarItem {...props} />;
};
