import * as React from 'react';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';

import styles from './styles';
import { SecondaryButtonProps } from './types';

const colors = theme.ui.button;

const stroke = (disabled?: boolean, pressed?: boolean) => {
  if (disabled) return { background: undefined, border: colors.disabledBackground, content: colors.disabledContent };
  if (pressed) return { background: colors.highlight, border: colors.pressedBackground, content: colors.pressedContent };
  return { background: undefined, border: colors.background, content: colors.content };
};

const SecondaryButton = (props: SecondaryButtonProps) => {
  const [pressed, setPressed] = React.useState(false);

  const state = stroke(props.disabled, pressed);

  return (
    <DefaultButton
      {...props}
      activeOpacity={1}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.secondary,
        { backgroundColor: state.background, borderColor: state.border },
        { ...(props.round ? styles.round : {}) },
        props.style,
      ]}
      contentColor={props.contentColor ?? state.content}
    />
  );
};

export default SecondaryButton;
