import * as React from 'react';
import { useState, useEffect } from 'react';
import { SecondaryButtonProps } from './types';
import DefaultButton from '~/framework/components/buttons/default';
import theme from '~/app/theme';

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
      onPressOut={() => setContentColor(contentColor)}
      style={{ borderColor: contentColor }}
      contentColor={contentColor}
    />
  );
};

export default SecondaryButton;
