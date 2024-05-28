import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { BadgeAvatar, BadgePosition } from '~/framework/components/badgeAvatar';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, CaptionBoldText, SmallText } from '~/framework/components/text';
import { AudienceReactionType, AudienceUserReaction } from '~/framework/modules/core/audience/types';
import { audienceReactionsInfos, validReactionTypes } from '~/framework/modules/core/audience/util';

import styles from './styles';
import { AudienceReactionsModalProps } from './types';

const AudienceReactionsModal = (props: AudienceReactionsModalProps) => {
  const [userReactions, setUserReactions] = React.useState<AudienceUserReaction[]>(props.userReactions);
  const [selectedItem, setSelectedItem] = React.useState<AudienceReactionType | null>(null);

  const resetFilter = () => {
    if (selectedItem === null) return;
    setUserReactions(props.userReactions);
    setSelectedItem(null);
  };
  const filterByType = (reactionType: AudienceReactionType) => {
    if (selectedItem === reactionType) return;
    setUserReactions(props.userReactions.filter(reaction => reaction.reactionType === reactionType));
    setSelectedItem(reactionType);
  };

  const renderHeaderItem = ({ item }: { item: { icon: string; nb: number; type: AudienceReactionType } }) => {
    return (
      <>
        <View style={styles.separator} />
        <TouchableOpacity
          style={[styles.headerItem, selectedItem === item.type ? styles.headerSelectedItem : null]}
          onPress={() => filterByType(item.type)}>
          <NamedSVG name={item.icon} />
          <SmallText>{item.nb}</SmallText>
        </TouchableOpacity>
      </>
    );
  };
  const renderHeaderList = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={resetFilter}>
          <SmallText>{I18n.get('audience-reactions-all')}</SmallText>
        </TouchableOpacity>
        {validReactionTypes.map(reactionType =>
          renderHeaderItem({
            item: { icon: audienceReactionsInfos[reactionType].icon, nb: props.countByType[reactionType] ?? 0, type: reactionType },
          }),
        )}
      </View>
    );
  };
  return (
    <PageView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeaderList}
        data={userReactions}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <BadgeAvatar
              userId={item.userId}
              badgeContent={audienceReactionsInfos[item.reactionType].icon}
              badgeColor={audienceReactionsInfos[item.reactionType].color}
              badgePosition={BadgePosition.bottom}
            />
            <View>
              <BodyText>{item.displayName}</BodyText>
              <CaptionBoldText>{I18n.get(`user-profiletypes-${item.profile.toLowerCase()}`)}</CaptionBoldText>
            </View>
          </View>
        )}
      />
    </PageView>
  );
};

export default AudienceReactionsModal;
