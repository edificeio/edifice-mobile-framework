import React from 'react';

import { BaseButtonProps } from 'react-native-gesture-handler';

import { BaseRectButton } from './base';
import styles from './styles';
import { GhostButtonProps } from './types';

import theme from '~/app/theme';
import { SmallBoldText } from '~/framework/components/text';

export const GhostButton = React.memo(function GhostButton({ disabled, outline = false, ...props }: GhostButtonProps) {
  const contentColor = disabled ? theme.palette.grey.stone : theme.palette.grey.black;
  const style = React.useMemo(() => {
    const ret: BaseButtonProps['style'] = [styles.ghost];
    if (outline) ret.push(styles.ghostOutline);
    if (disabled) ret.push(styles.ghostDisabled);
    return ret;
  }, [disabled, outline]);
  return (
    <BaseRectButton
      disabled={disabled}
      style={style}
      activeStyle={styles.ghostActive}
      contentColor={contentColor}
      contentColorActive={theme.palette.grey.darkness}
      TextComponent={SmallBoldText}
      {...props}
    />
  );
});
