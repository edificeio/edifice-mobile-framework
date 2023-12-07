import * as React from 'react';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/component';

import { RichToolbarMenuItemProps } from './types';

export const RichToolbarMenuItem = (props: RichToolbarMenuItemProps) => {
  const handleSelected = () => {
    console.log('change toolbar');
    props.onSelected();
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
