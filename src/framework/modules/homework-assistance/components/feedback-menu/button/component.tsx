import * as React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import styles from './styles';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';

export type FeedbackMenuButtonProps = {
  isDisabled?: boolean;
  style?: ViewStyle;
  action?: () => void;
};

const FeedbackMenuButton: React.FunctionComponent<FeedbackMenuButtonProps> = ({ action, isDisabled = false, style }) => {
  return (
    <TouchableOpacity onPress={action} disabled={isDisabled} style={[styles.container, style]}>
      <Svg name="ui-comment-quote" width={24} height={24} fill={theme.palette.grey.white} />
    </TouchableOpacity>
  );
};

export default FeedbackMenuButton;
