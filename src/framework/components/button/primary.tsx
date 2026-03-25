import React from 'react';

import { BasePillButton } from './base';
import styles from './styles';
import { SpecificButtonProps } from './types';

import theme from '~/app/theme';
import { SmallInverseBoldText } from '~/framework/components/text';

export const PrimaryButton = React.memo(function PrimaryButton({ disabled, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={React.useMemo(() => (disabled ? [styles.primary, styles.primaryDisabled] : styles.primary), [disabled])}
      activeStyle={styles.primaryActive}
      contentColor={theme.ui.text.inverse}
      TextComponent={SmallInverseBoldText}
      {...props}
    />
  );
});
