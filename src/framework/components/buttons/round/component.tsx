import * as React from 'react';

import ActionButton from '~/framework/components/buttons/action';

import styles from './styles';
import { RoundButtonProps } from './types';

const RoundButton = ({ iconName, action, disabled, loading }: RoundButtonProps) => {
  return (
    <ActionButton
      text=""
      iconName={iconName}
      action={action}
      disabled={disabled || loading}
      loading={loading}
      style={styles.roundButton}
    />
  );
};

export default RoundButton;
