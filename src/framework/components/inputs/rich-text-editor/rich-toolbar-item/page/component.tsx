import * as React from 'react';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/component';

import { RichToolbarPageItemProps } from './types';

export const RichToolbarPageItem = (props: RichToolbarPageItemProps) => {
  const handleSelected = () => {
    console.log('replace keyboard by page');
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
