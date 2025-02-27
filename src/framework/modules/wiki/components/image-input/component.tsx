import React from 'react';
import { View } from 'react-native';

import { INPUT_BUTTON_COLOR, styles } from './styles';

import ModuleImage from '~/framework/components/picture/module-image';
import ImageInputButton from '~/framework/modules/wiki/components/image-input-button';

const ImageInput = ({ moduleConfig }) => {
  return (
    <View style={styles.container}>
      <ModuleImage moduleConfig={moduleConfig} src={'https://xpicsum.photos/200'} style={styles.imgContainer} />
      <ImageInputButton contentColor={INPUT_BUTTON_COLOR} icon="ui-edit" />
    </View>
  );
};

export default ImageInput;
