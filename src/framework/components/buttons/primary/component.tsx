import * as React from 'react';
import { useEffect, useState } from 'react';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';

import styles from './styles';
import { PrimaryButtonProps } from './types';

const PrimaryButton = (props: PrimaryButtonProps) => {
  const initialBackgroundColor = theme.palette.primary.regular;

  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);

  useEffect(() => {
    if (props.disabled) setBackgroundColor(theme.palette.primary.light);
    if (!props.disabled && backgroundColor === theme.palette.primary.light) setBackgroundColor(initialBackgroundColor);
  });
  return (
    <DefaultButton
      {...props}
      activeOpacity={1}
      onPressIn={() => setBackgroundColor(theme.palette.primary.dark)}
      onPressOut={() => setBackgroundColor(initialBackgroundColor)}
      style={[styles.primary, { backgroundColor }, { ...(props.round ? styles.round : {}) }, props.style]}
      contentColor={theme.palette.grey.white}
    />
  );
};

export default PrimaryButton;
