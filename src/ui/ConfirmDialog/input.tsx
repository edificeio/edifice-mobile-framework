import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { layoutSize } from '~/styles/common/layoutSize';

type IProps = {
  value: string;
  onChangeText: (event) => void;
};

export default class DialogInput extends React.PureComponent<IProps> {
  static displayName = 'DialogInput';

  render() {
    const { value, ...otherProps } = this.props;
    return <TextInput autoFocus style={styles.textInput} value={value} {...otherProps} />;
  }
}

const styles = StyleSheet.create({
  textInput: {
    color: theme.ui.text.regular,
    fontSize: layoutSize.LAYOUT_16,
    borderColor: '#00000012',
    borderBottomWidth: 1,
    marginBottom: UI_SIZES.spacing.small,
  },
});
