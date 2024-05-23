import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { audienceService } from '~/framework/modules/core/audience/service';
import { AudienceReactionType } from '~/framework/modules/core/audience/types';
import { audienceReactionsInfos } from '~/framework/modules/core/audience/util';
import { isEmpty } from '~/framework/util/object';

import AudienceReactButton from './react-button';
import styles from './styles';
import { AudienceMeasurementProps } from './types';

const AudienceMeasurement = (props: AudienceMeasurementProps) => {
  const [totalReactions, setTotalReactions] = React.useState<number>(props.infosReactions?.total ?? 0);
  const [typesReactions, setTypesReactions] = React.useState<AudienceReactionType[]>(props.infosReactions?.types ?? []);
  const [userReaction, setUserReaction] = React.useState<AudienceReactionType | null>(props.infosReactions?.userReaction ?? null);

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
      console.error('[AudienceMeasurement] refreshData error :', e);
    }
  };

  const deleteReaction = async () => {
    try {
      await audienceService.reaction.delete(props.session, props.referer);
      refreshData();
    } catch (e) {
      console.error('[AudienceMeasurement] deleteReaction error :', e);
    }
  };

  const postReaction = async (reaction: AudienceReactionType) => {
    try {
      await audienceService.reaction.post(props.session, props.referer, reaction);
      refreshData();
    } catch (e) {
      console.error('[AudienceMeasurement] postReaction error :', e);
    }
  };

  const updateReaction = async (reaction: AudienceReactionType) => {
    try {
      await audienceService.reaction.update(props.session, props.referer, reaction);
      refreshData();
    } catch (e) {
      console.error('[AudienceMeasurement] updateReaction error :', e);
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
            <TouchableOpacity onPress={props.actionReactions} style={styles.statsItem}>
              <SmallText style={styles.statsItemText}>{totalReactions ?? 0}</SmallText>
              <View style={styles.statsReactions}>
                {!isEmpty(typesReactions) ? (
                  typesReactions.map(reaction => (
                    <NamedSVG
                      key={reaction}
                      name={audienceReactionsInfos[reaction].roundIcon}
                      height={UI_SIZES.elements.icon.default}
                      width={UI_SIZES.elements.icon.default}
                    />
                  ))
                ) : (
                  <NamedSVG
                    name={audienceReactionsInfos[AudienceReactionType.REACTION_1].roundIcon}
                    height={UI_SIZES.elements.icon.default}
                    width={UI_SIZES.elements.icon.default}
                  />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={props.actionViews} style={styles.statsItem}>
              <SmallText style={styles.statsItemText}>{props.nbViews ?? 0}</SmallText>
              <NamedSVG
                name="ui-see"
                fill={theme.palette.grey.graphite}
                height={UI_SIZES.elements.icon.small}
                width={UI_SIZES.elements.icon.small}
              />
            </TouchableOpacity>
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

export default AudienceMeasurement;
