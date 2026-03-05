import * as React from 'react';
import { View } from 'react-native';

import LottieView from 'lottie-react-native';

import { styles } from './styles';
import { MAOSProps } from './types';

import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText, HeadingXSText } from '~/framework/components/text';

export const MyAppsOnboardingSlide: React.FC<MAOSProps> = ({ description, illustration, isActive, subtitle, title }) => {
  const animationRef = React.useRef<LottieView>(null);

  React.useEffect(() => {
    if (illustration.type === 'animated' && isActive) {
      animationRef.current?.play();
    } else {
      animationRef.current?.reset();
    }
  }, [isActive, illustration.type]);

  return (
    <View style={styles.containerSlide}>
      <View style={styles.titleWrapper}>
        <HeadingXSText style={styles.title}>{title}</HeadingXSText>
      </View>

      <View style={styles.illustrationWrapper}>
        {illustration.type === 'svg' && <Svg name={illustration.name} width="100%" height="100%" />}
        {illustration.type === 'animated' && (
          <LottieView
            ref={animationRef}
            source={illustration.source}
            resizeMode="contain"
            loop
            speed={0.8}
            autoPlay={false}
            renderMode="HARDWARE"
            style={styles.animation}
          />
        )}
      </View>
      <View style={styles.bottomContainerWrapper}>
        <BodyText style={styles.description}>
          <BodyBoldText style={styles.description}>{subtitle}</BodyBoldText> {description}
        </BodyText>
      </View>
    </View>
  );
};
