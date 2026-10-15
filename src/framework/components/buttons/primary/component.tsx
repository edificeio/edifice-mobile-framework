import * as React from 'react';

import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_SIZES } from '~/framework/components/constants';

import styles from './styles';
import { PrimaryButtonProps } from './types';

const colors = theme.ui.button;

// A filled button paints its body with the accent, and its content has to read on that body.
const fill = (disabled?: boolean, pressed?: boolean) => {
  if (disabled) return { background: colors.disabledBackground, borderWidth: 0, content: colors.disabledContentOnFill };
  return {
    background: pressed ? colors.pressedBackground : colors.background,
    borderWidth: UI_SIZES.elements.border.default,
    content: colors.contentOnFill,
  };
};

const PrimaryButton = (props: PrimaryButtonProps) => {
  const [pressed, setPressed] = React.useState(false);

  const state = fill(props.disabled, pressed);

  return (
    <DefaultButton
      {...props}
      activeOpacity={1}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.primary,
        { backgroundColor: state.background, borderColor: state.background, borderWidth: state.borderWidth },
        { ...(props.round ? styles.round : {}) },
        props.style,
      ]}
      contentColor={props.contentColor ?? state.content}
    />
  );
};

export default PrimaryButton;
