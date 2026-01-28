import * as React from 'react';
import { View } from 'react-native';

import LottieView from 'lottie-react-native';

import { styles } from './styles';
import { MAOSProps } from './types';

import { getScaleWidth } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText, HeadingXSText } from '~/framework/components/text';

export const MyAppsOnboardingSlide: React.FC<MAOSProps> = ({ description, illustration, isActive, title }) => {
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
      <HeadingXSText style={styles.title}>{title}</HeadingXSText>

      {illustration.type === 'svg' && (
        <View style={{ height: getScaleWidth(180), width: getScaleWidth(180) }}>
          <Svg name={illustration.name} width={getScaleWidth(180)} height={getScaleWidth(180)} />
        </View>
      )}

      {illustration.type === 'animated' && (
        <LottieView
          ref={animationRef}
          resizeMode="contain"
          source={illustration.source}
          autoPlay
          loop={false}
          speed={0.8}
          style={styles.animation}
        />
      )}
      <BodyText style={styles.description}>{description}</BodyText>
    </View>
  );
};
