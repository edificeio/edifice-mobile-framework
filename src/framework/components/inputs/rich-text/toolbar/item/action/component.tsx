import * as React from 'react';

import { RichToolbarActionItemProps } from './types';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text/toolbar/item/component';

export const RichToolbarActionItem = (props: RichToolbarActionItemProps) => {
  const { action, editor } = props;

  const handleSelected = () => {
    editor?.showAndroidKeyboard();
    editor?.sendAction(action, 'result');
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
