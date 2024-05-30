import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { audienceService } from '~/framework/modules/core/audience/service';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { isEmpty } from '~/framework/util/object';

import AudienceReactButton from './button';
import styles from './styles';
import { AudienceProps } from './types';

const Audience = (props: AudienceProps) => {
  const [totalReactions, setTotalReactions] = React.useState<number>(0);
  const [typesReactions, setTypesReactions] = React.useState<string[]>([]);
  const [userReaction, setUserReaction] = React.useState<string | null>(null);

  const Component = props.preview ? View : TouchableOpacity;

  const navigation =
    useNavigation<
      NavigationProp<IModalsNavigationParams, typeof ModalsRouteNames.AudienceReactions | typeof ModalsRouteNames.AudienceViews>
    >();

  useEffect(() => {
    setTotalReactions(props.infosReactions?.total ?? 0);
    setTypesReactions(props.infosReactions?.types ?? []);
    setUserReaction(props.infosReactions?.userReaction ?? null);
  }, [props.infosReactions]);

  const refreshData = async () => {
    try {
      const dt = await audienceService.reaction.getSummary(props.referer.module, props.referer.resourceType, [
        props.referer.resourceId,
      ]);
      const newReactionInfos = dt.reactionsByResource[props.referer.resourceId];
      setUserReaction(newReactionInfos?.userReaction);
      setTotalReactions(newReactionInfos?.totalReactionsCounter);
      setTypesReactions(newReactionInfos?.reactionTypes);
    } catch (e) {
      console.error('[Audience] refreshData error :', e);
    }
  };

  const deleteReaction = async () => {
    try {
      await audienceService.reaction.delete(props.session, props.referer);
      refreshData();
    } catch (e) {
      console.error('[Audience] deleteReaction error :', e);
    }
  };

  const postReaction = async (reaction: string) => {
    try {
      await audienceService.reaction.post(props.session, props.referer, reaction);
      refreshData();
    } catch (e) {
      console.error('[Audience] postReaction error :', e);
    }
  };

  const updateReaction = async (reaction: string) => {
    try {
      await audienceService.reaction.update(props.session, props.referer, reaction);
      refreshData();
    } catch (e) {
      console.error('[Audience] updateReaction error :', e);
    }
  };

  const renderPlaceholder = () => {
    return (
      <Placeholder Animation={Fade}>
        <View style={styles.placeholderRow}>
          <PlaceholderLine style={styles.h24} width={15} />
          <PlaceholderLine style={styles.h24} width={10} />
          <PlaceholderLine style={styles.h24} width={10} />
        </View>
        <PlaceholderLine style={[styles.h30, styles.mb0]} width={30} />
      </Placeholder>
    );
  };

  return (
    <View style={props.containerStyle}>
      {props.nbViews === undefined ? (
        renderPlaceholder()
      ) : (
        <>
          <View style={styles.stats}>
            <Component
              onPress={() => navigation.navigate(ModalsRouteNames.AudienceReactions, { referer: props.referer })}
              style={styles.statsItem}>
              <SmallText style={styles.statsItemText}>{totalReactions ?? 0}</SmallText>
              <View style={styles.statsReactions}>
                {!isEmpty(typesReactions) ? (
                  typesReactions.map(reaction => (
                    <NamedSVG
                      key={reaction}
                      name={`${reaction.toLowerCase()}-round`}
                      height={UI_SIZES.elements.icon.default}
                      width={UI_SIZES.elements.icon.default}
                    />
                  ))
                ) : (
                  <NamedSVG
                    name="reaction_1-round"
                    height={UI_SIZES.elements.icon.default}
                    width={UI_SIZES.elements.icon.default}
                  />
                )}
              </View>
            </Component>
            <Component
              onPress={() => navigation.navigate(ModalsRouteNames.AudienceViews, { referer: props.referer })}
              style={styles.statsItem}>
              <SmallText style={styles.statsItemText}>{props.nbViews ?? 0}</SmallText>
              <NamedSVG
                name="ui-see"
                fill={theme.palette.grey.graphite}
                height={UI_SIZES.elements.icon.small}
                width={UI_SIZES.elements.icon.small}
              />
            </Component>
            <View style={styles.statsItem}>
              <SmallText style={styles.statsItemText}>{props.nbComments ?? 0}</SmallText>
              <NamedSVG
                name="ui-messageInfo"
                fill={theme.palette.grey.graphite}
                height={UI_SIZES.elements.icon.small}
                width={UI_SIZES.elements.icon.small}
              />
            </View>
          </View>
          <AudienceReactButton
            postReaction={postReaction}
            deleteReaction={deleteReaction}
            updateReaction={updateReaction}
            userReaction={userReaction}
          />
        </>
      )}
    </View>
  );
};

export default Audience;
