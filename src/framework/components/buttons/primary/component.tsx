import * as React from 'react';
import { useState, useEffect } from 'react';
import { PrimaryButtonProps } from './types';
import DefaultButton from '~/framework/components/buttons/default';
import styles from './styles';
import theme from '~/app/theme';

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
      style={[styles.primary, { backgroundColor: backgroundColor }]}
      contentColor={theme.palette.grey.white}
    />
  );
};

export default PrimaryButton;
