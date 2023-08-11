import * as React from 'react';
import { useState, useEffect } from 'react';
import { TertiaryButtonProps } from './types';
import DefaultButton from '~/framework/components/buttons/default';
import theme from '~/app/theme';

const TertiaryButton = (props: TertiaryButtonProps) => {
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
      contentColor={contentColor}
    />
  );
};

export default TertiaryButton;
