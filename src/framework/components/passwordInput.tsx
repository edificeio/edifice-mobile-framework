import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextField } from 'rn-material-ui-textfield';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    top: 33,
    right: 0,
  },
  input: {
    paddingRight: UI_SIZES.dimensions.width.largePlus,
  },
});

const PasswordInput = ({ iconSize = 25, iconColor = theme.ui.text.light, label = '', style, getRef, ...rest }) => {
  const getVisibilityIcon = isPassword => (isPassword ? 'visibility-off' : 'visibility');

  const [eyeIcon, setEyeIcon] = useState(getVisibilityIcon(false));
  const [isPassword, setIsPassword] = useState(true);

  const changePwdType = () => {
    setEyeIcon(getVisibilityIcon(isPassword));
    setIsPassword(prevState => !prevState);
  };

  const passReference = ref => {
    if (getRef) getRef(ref);
  };

  return (
    <View style={style}>
      <TextField {...rest} ref={passReference} secureTextEntry={isPassword} label={label} style={styles.input} />
      <Icon
        style={styles.icon}
        name={eyeIcon}
        size={iconSize}
        color={iconColor}
        onPress={changePwdType}
        testID="login-see-password"
      />
    </View>
  );
};

export default PasswordInput;
