import * as React from 'react';
import { View } from 'react-native';

import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText, HeadingSText, SmallBoldText } from '~/framework/components/text';

import { styles } from './styles';
import { ActionCardProps } from './types';

const ActionCard = ({ actionIcon, actionText, description, onAction, picture, testId, title }: Readonly<ActionCardProps>) => {
  return (
    <View style={styles.container}>
      <Svg name={picture} width={styles.illustration.width} height={styles.illustration.height} />

      <View style={styles.textContainer}>
        <HeadingSText style={styles.title}>{title}</HeadingSText>
        <BodyText style={styles.description}>{description}</BodyText>
        <TertiaryButton
          action={onAction}
          testID={testId}
          iconLeft={actionIcon}
          text={actionText}
          TextComponent={SmallBoldText}
          style={{ paddingVertical: UI_SIZES.spacing.tiny }}
        />
      </View>
    </View>
  );
};

export default ActionCard;
