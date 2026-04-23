import React from 'react';

import { SmallBoldText } from '~/framework/components/text';

import { BasePillButton } from './base';
import styles from './styles';
import { SpecificButtonProps } from './types';

export const SecondaryButton = React.memo(function SecondaryButton({ disabled, style, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={React.useMemo(
        () => (disabled ? [styles.secondary, styles.secondaryDisabled, style] : [styles.secondary, style]),
        [disabled, style],
      )}
      activeStyle={styles.secondaryActive}
      contentColor={disabled ? styles.secondaryDisabled.borderColor : styles.secondary.borderColor}
      contentColorActive={styles.secondaryActive.borderColor}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
