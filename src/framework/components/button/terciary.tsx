import React from 'react';

import { BasePillButton } from './base';
import styles from './styles';
import { SpecificButtonProps } from './types';

import { SmallBoldText } from '~/framework/components/text';

export const TerciaryButton = React.memo(function TerciaryButton({ disabled, ...props }: SpecificButtonProps) {
  return (
    <BasePillButton
      disabled={disabled}
      style={React.useMemo(() => (disabled ? [styles.terciary, styles.terciaryDisabled] : styles.terciary), [disabled])}
      activeStyle={styles.terciaryActive}
      contentColor={disabled ? styles.terciaryDisabled.borderColor : styles.terciary.borderColor}
      contentColorActive={styles.terciaryActive.borderColor}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
