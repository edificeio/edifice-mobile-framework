import * as React from 'react';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text/toolbar/item/component';

import { RichToolbarCustomItemProps } from './types';

export const RichToolbarCustomItem = (props: RichToolbarCustomItemProps) => {
  const handleSelected = () => {
    props.action();
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
