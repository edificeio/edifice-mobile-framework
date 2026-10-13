import React from 'react';

import theme from '~/app/theme';
import { SmallBoldText } from '~/framework/components/text';

import { BasePillButton } from './base';
import { SpecificButtonProps } from './types';

export const TerciaryButton = React.memo(function TerciaryButton({ disabled, style, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={style}
      contentColor={disabled ? theme.ui.button.disabledContent : theme.ui.button.content}
      contentColorActive={theme.ui.button.pressedContent}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
