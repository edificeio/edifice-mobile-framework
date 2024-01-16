import * as React from 'react';
import { useEffect, useState } from 'react';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';

import styles from './styles';
import { SecondaryButtonProps } from './types';

const SecondaryButton = (props: SecondaryButtonProps) => {
  const initialContentColor = theme.palette.primary.regular;

  const [contentColor, setContentColor] = useState(initialContentColor);

  useEffect(() => {
    if (props.disabled) setContentColor(theme.palette.primary.light);
    if (!props.disabled && contentColor === theme.palette.primary.light) setContentColor(initialContentColor);
  });
  return (
    <DefaultButton
      {...props}
      activeOpacity={1}
      onPressIn={() => setContentColor(theme.palette.primary.dark)}
      onPressOut={() => setContentColor(initialContentColor)}
      style={[styles.secondary, { borderColor: contentColor }, { ...(props.round ? styles.round : {}) }, props.style]}
      contentColor={contentColor}
    />
  );
};

export default SecondaryButton;
