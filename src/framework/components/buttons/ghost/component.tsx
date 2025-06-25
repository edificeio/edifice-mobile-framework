import * as React from 'react';
import { useEffect, useState } from 'react';

import styles from './styles';
import { GhostButtonProps } from './types';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';

const GhostButton = ({ outline, style, ...props }: GhostButtonProps) => {
  const initialContentColor = props.contentColor ?? theme.palette.grey.black;

  const [contentColor, setContentColor] = useState(initialContentColor);

  useEffect(() => {
    if (props.disabled) setContentColor(theme.palette.grey.stone);
    if (!props.disabled && contentColor === theme.palette.grey.stone) setContentColor(initialContentColor);
  }, [contentColor, initialContentColor, props.disabled]);
  return (
    <DefaultButton
      {...props}
      style={React.useMemo(() => [outline ? styles.outline : undefined, styles.ghost, style], [outline, style])}
      activeOpacity={1}
      onPressIn={() => setContentColor(theme.palette.grey.darkness)}
      onPressOut={() => setContentColor(initialContentColor)}
      contentColor={contentColor}
    />
  );
};

export default GhostButton;
