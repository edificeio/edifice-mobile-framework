import * as React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';

export type FeedbackMenuButtonProps = {
  isDisabled?: boolean;
  style?: ViewStyle;
  action?: () => void;
};

const FeedbackMenuButton: React.FunctionComponent<FeedbackMenuButtonProps> = ({ isDisabled = false, style, action }) => {
  return (
    <TouchableOpacity onPress={action} disabled={isDisabled} style={[styles.container, style]}>
      <NamedSVG name="ui-comment-quote" width={24} height={24} fill={theme.palette.grey.white} />
    </TouchableOpacity>
  );
};

export default FeedbackMenuButton;
