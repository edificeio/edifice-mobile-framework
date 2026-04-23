import React from 'react';

import { SmallBoldText } from '~/framework/components/text';

import { BasePillButton } from './base';
import styles from './styles';
import { SpecificButtonProps } from './types';

export const TerciaryButton = React.memo(function TerciaryButton({ disabled, style, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={React.useMemo(
        () => (disabled ? [styles.terciary, styles.terciaryDisabled, style] : [styles.terciary, style]),
        [disabled, style],
      )}
      activeStyle={styles.terciaryActive}
      contentColor={disabled ? styles.terciaryDisabled.borderColor : styles.terciary.borderColor}
      contentColorActive={styles.terciaryActive.borderColor}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
