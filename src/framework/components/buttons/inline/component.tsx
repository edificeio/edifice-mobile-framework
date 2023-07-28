import * as React from 'react';

import theme from '~/app/theme';
import ActionButton, { ActionButtonProps } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';

import styles from './styles';

const InlineButton = (props: ActionButtonProps) => {
  return (
    <ActionButton
      text={props.text}
      iconName={props.iconName}
      action={props.action}
      style={styles.inlineButton}
      pictureSize={UI_SIZES.dimensions.height.mediumPlus}
      pictureFill={theme.palette.primary.regular}
      pictureStyle={styles.picture}
      textColor={theme.palette.primary.regular}
    />
  );
};

export default InlineButton;
