import * as React from 'react';

import styles from './styles';
import { PictureButtonProps } from './types';

import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';

const PictureButton = ({ action, disabled, iconName, loading, pictureFill }: PictureButtonProps) => {
  return (
    <ActionButton
      text=""
      iconName={iconName}
      action={action}
      disabled={disabled || loading}
      loading={loading}
      style={styles.pictureButton}
      pictureSize={UI_SIZES.dimensions.height.large}
      pictureFill={pictureFill ?? theme.palette.grey.darkness}
    />
  );
};

export default PictureButton;
