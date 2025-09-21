import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { ModuleLineButtonProps } from './types';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallActionText, SmallText } from '~/framework/components/text';
import { Image } from '~/framework/util/media';

export const ModuleLineButton = (props: ModuleLineButtonProps) => {
  const { displayI18n, displayPicture, onPress } = props;

  const renderPicture = () => {
    switch (displayPicture.type) {
      case 'Svg':
        return <Svg {...displayPicture} height={UI_SIZES.elements.icon.medium} width={UI_SIZES.elements.icon.medium} />;
      case 'Image':
        return <Image source={displayPicture.source} style={styles.imagePicture} />;
      default:
        return null;
    }
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.infos}>
        {renderPicture()}
        <SmallText>{I18n.get(displayI18n)}</SmallText>
      </View>
      <SmallActionText>{I18n.get('myapp-widgets-more')}</SmallActionText>
    </TouchableOpacity>
  );
};
