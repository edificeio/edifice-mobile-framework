import * as React from 'react';

import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';

import styles from './styles';
import { CloseButtonProps } from './types';

const CloseButton = ({ iconName, action, disabled, loading, pictureFill, size, style }: CloseButtonProps) => {
  return (
    <ActionButton
      text=""
      iconName={iconName || 'ui-close'}
      action={action}
      disabled={disabled || loading}
      loading={loading}
      style={[styles.closeButton, style]}
      pictureSize={size || UI_SIZES.dimensions.height.mediumPlus}
      pictureFill={pictureFill ?? theme.palette.grey.graphite}
    />
  );
};

export default CloseButton;
