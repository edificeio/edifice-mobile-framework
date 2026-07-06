import React from 'react';

import theme from '~/app/theme';
import { SmallInverseBoldText } from '~/framework/components/text';

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
      contentColor={theme.ui.text.inverse}
      TextComponent={SmallInverseBoldText}
      {...props}
    />
  );
});
