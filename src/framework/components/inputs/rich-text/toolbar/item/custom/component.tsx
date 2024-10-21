import * as React from 'react';

import { RichToolbarCustomItemProps } from './types';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text/toolbar/item/component';

export const RichToolbarCustomItem = (props: RichToolbarCustomItemProps) => {
  const handleSelected = () => {
    props.action();
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
