import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';

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
    color: CommonStyles.textInputColor,
    fontSize: layoutSize.LAYOUT_16,
    borderColor: '#00000012',
    borderBottomWidth: 1,
    marginBottom: layoutSize.LAYOUT_14,
  },
});
