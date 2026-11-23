import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { isEmpty } from '~/framework/util/object';
import { getReactionIconName } from '~/modules/audience/util';

import styles from './styles';
import type { AudienceBarProps } from './types';

const AudienceBarPlaceholder = () => (
  <Placeholder Animation={Fade}>
    <View style={styles.placeholderRow}>
      <PlaceholderLine style={styles.h24} width={15} />
      <PlaceholderLine style={styles.h24} width={10} />
      <PlaceholderLine style={styles.h24} width={10} />
    </View>
    <PlaceholderLine style={[styles.h30, styles.mb0]} width={30} />
  </Placeholder>
);

const ReactionIcon = ({ reactionType, style }: { reactionType: string; style?: typeof styles.statsReactionsItem }) => {
  const name = getReactionIconName(reactionType, true);
  return name ? (
    <Svg name={name} height={UI_SIZES.elements.icon.default} width={UI_SIZES.elements.icon.default} style={style} />
  ) : null;
};

/**
 * The counters of the reactions, views and comments of a resource, and the react button (`children`).
 * A skeleton until the valid reaction types of the platform are known.
 */
const AudienceBar = ({
  children,
  containerStyle,
  isManager,
  nbComments,
  nbViews,
  onPressReactions,
  onPressViews,
  preview,
  reactionTypes,
  showComments = true,
  totalReactions,
  userReaction,
  validReactionTypes,
}: Readonly<AudienceBarProps>) => {
  if (!validReactionTypes || isEmpty(validReactionTypes)) return <AudienceBarPlaceholder />;

  const Component = preview ? View : TouchableOpacity;
  const TextComponent = userReaction ? SmallBoldText : SmallText;

  return (
    <View style={containerStyle}>
      <View style={styles.stats}>
        <Component onPress={preview ? undefined : onPressReactions} style={styles.statsItem}>
          <TextComponent style={styles.statsItemText} testID="label-count-reaction">
            {totalReactions ?? 0}
          </TextComponent>
          <View style={styles.statsReactions}>
            {!isEmpty(reactionTypes) ? (
              reactionTypes.map(reaction => (
                <ReactionIcon key={reaction} reactionType={reaction} style={styles.statsReactionsItem} />
              ))
            ) : (
              <ReactionIcon reactionType={validReactionTypes[0]} />
            )}
          </View>
        </Component>
        {isManager ? (
          <Component onPress={preview ? undefined : onPressViews} style={styles.statsItem}>
            <SmallText style={styles.statsItemText} testID="label-count-view">
              {nbViews ?? 0}
            </SmallText>
            <Svg
              name="ui-see"
              fill={theme.palette.grey.graphite}
              height={UI_SIZES.elements.icon.small}
              width={UI_SIZES.elements.icon.small}
            />
          </Component>
        ) : null}
        {showComments && (
          <View style={styles.statsItem}>
            <SmallText style={styles.statsItemText} testID="label-count-comment">
              {nbComments ?? 0}
            </SmallText>
            <Svg
              name="ui-messageInfo"
              fill={theme.palette.grey.graphite}
              height={UI_SIZES.elements.icon.small}
              width={UI_SIZES.elements.icon.small}
            />
          </View>
        )}
      </View>
      {children}
    </View>
  );
};

export default React.memo(AudienceBar);
