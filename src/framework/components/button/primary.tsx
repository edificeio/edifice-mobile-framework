import React from 'react';

import theme from '~/app/theme';
import { SmallBoldText } from '~/framework/components/text';

import { BasePillButton } from './base';
import styles from './styles';
import { SpecificButtonProps } from './types';

export const PrimaryButton = React.memo(function PrimaryButton({ disabled, style, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={React.useMemo(
        () => (disabled ? [styles.primary, styles.primaryDisabled, style] : [styles.primary, style]),
        [disabled, style],
      )}
      activeStyle={styles.primaryActive}
      contentColor={disabled ? theme.ui.button.disabledContentOnFill : theme.ui.button.contentOnFill}
      contentColorActive={theme.ui.button.contentOnFill}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
