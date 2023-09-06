import * as React from 'react';

import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';

import styles from './styles';
import { TertiaryButtonProps } from './types';

const TertiaryButton = ({ iconName, action, disabled, loading, pictureFill, text }: TertiaryButtonProps) => {
  return (
    <ActionButton
      text={text}
      iconName={iconName}
      action={action}
      disabled={disabled || loading}
      loading={loading}
      style={styles.tertiaryButton}
      pictureFill={pictureFill}
      textColor={theme.palette.grey.graphite}
    />
  );
};

export default TertiaryButton;
