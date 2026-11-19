import * as React from 'react';
import { View } from 'react-native';

import PrimaryButton from '~/framework/components/buttons/primary';
import { getScaleWidth } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { HeadingSText, SmallText } from '~/framework/components/text';

import styles from './styles';
import type { SignInIntroductionScreenTemplateProps } from './types';

export const SignInIntroductionScreenTemplate = React.memo(function ({
  buttonText,
  description,
  onContinue,
  svgName,
  title,
}: SignInIntroductionScreenTemplateProps) {
  return (
    <View style={styles.page}>
      <View style={styles.topContainer}>
        <Svg name={svgName} width={getScaleWidth(130)} height={getScaleWidth(130)} />
        <HeadingSText style={styles.title}>{title}</HeadingSText>
        <SmallText style={styles.description}>{description}</SmallText>
      </View>
      <View style={styles.bottomContainer}>
        <PrimaryButton text={buttonText} iconRight="ui-arrowRight" style={styles.button} action={onContinue} />
      </View>
    </View>
  );
});
SignInIntroductionScreenTemplate.displayName = 'SignInIntroductionScreenTemplate';
