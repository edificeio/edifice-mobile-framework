import * as React from 'react';

import { RichToolbarItem } from '~/framework/components/inputs/rich-text/toolbar/item/component';

import { RichToolbarActionItemProps } from './types';

export const RichToolbarActionItem = (props: RichToolbarActionItemProps) => {
  const { editor, action } = props;

  const handleSelected = () => {
    editor.showAndroidKeyboard();
    editor.sendAction(action, 'result');
  };

  return <RichToolbarItem {...props} onSelected={handleSelected} />;
};
