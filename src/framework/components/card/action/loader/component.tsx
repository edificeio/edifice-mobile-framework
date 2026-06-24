import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { styles } from '~/framework/components/card/action/styles';

import { LINE_PLACEHOLDER_HEIGHT, loaderStyles, TITLE_PLACEHOLDER_HEIGHT } from './styles';

const ActionCardLoader = () => {
  return (
    <View style={styles.container}>
      <Placeholder Animation={Fade}>
        <PlaceholderMedia style={loaderStyles.illustration} />
        <View style={styles.textContainer}>
          <PlaceholderLine noMargin height={TITLE_PLACEHOLDER_HEIGHT} style={loaderStyles.titlePlaceholder} />
          <PlaceholderLine noMargin height={LINE_PLACEHOLDER_HEIGHT} style={loaderStyles.linePlaceholder} />
          <PlaceholderLine noMargin height={LINE_PLACEHOLDER_HEIGHT} style={loaderStyles.linePlaceholder} />
          <PlaceholderLine noMargin height={LINE_PLACEHOLDER_HEIGHT} style={loaderStyles.shortLinePlaceholder} />
          <PlaceholderMedia style={loaderStyles.buttonPlaceholder} />
        </View>
      </Placeholder>
    </View>
  );
};

export default ActionCardLoader;
