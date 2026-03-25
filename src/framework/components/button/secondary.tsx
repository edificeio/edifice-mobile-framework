import React from 'react';

import { BasePillButton } from './base';
import styles from './styles';
import { SpecificButtonProps } from './types';

import { SmallBoldText } from '~/framework/components/text';

export const SecondaryButton = React.memo(function SecondaryButton({ disabled, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={React.useMemo(() => (disabled ? [styles.secondary, styles.secondaryDisabled] : styles.secondary), [disabled])}
      activeStyle={styles.secondaryActive}
      contentColor={disabled ? styles.secondaryDisabled.borderColor : styles.secondary.borderColor}
      contentColorActive={styles.secondaryActive.borderColor}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
