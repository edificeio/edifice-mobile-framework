import * as React from 'react';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/component';

import { RichToolbarMenuItemProps } from './types';

export const RichToolbarMenuItem = (props: RichToolbarMenuItemProps) => {
  const handleSelected = () => {
    props.onSelected(props.menu);
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
