import React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { BadgeAvatar, BadgePosition } from '~/framework/components/badgeAvatar';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, CaptionBoldText, SmallText } from '~/framework/components/text';
import { reactionsInfo } from '~/framework/modules/core/audience/util';

import styles from './styles';
import { AudienceMeasurementReactionsModalProps } from './types';

const AudienceMeasurementReactionsModal = (props: AudienceMeasurementReactionsModalProps) => {
  const renderHeaderItem = ({ item }: { item: { icon: string; nb: number } }) => {
    return (
      <>
        <View style={styles.separator} />
        <View style={styles.headerItem}>
          <NamedSVG name={item.icon} />
          <SmallText>{item.nb}</SmallText>
        </View>
      </>
    );
  };
  const renderHeaderList = () => {
    return (
      <View style={styles.header}>
        <SmallText>{I18n.get('audiencemeasurement-reactions-all')}</SmallText>
        {renderHeaderItem({ item: { icon: reactionsInfo.REACTION_1.icon, nb: props.countByType.REACTION_1 ?? 0 } })}
        {renderHeaderItem({ item: { icon: reactionsInfo.REACTION_2.icon, nb: props.countByType.REACTION_2 ?? 0 } })}
        {renderHeaderItem({ item: { icon: reactionsInfo.REACTION_3.icon, nb: props.countByType.REACTION_3 ?? 0 } })}
        {renderHeaderItem({ item: { icon: reactionsInfo.REACTION_4.icon, nb: props.countByType.REACTION_4 ?? 0 } })}
      </View>
    );
  };
  return (
    <PageView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeaderList}
        data={props.userReactions}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <BadgeAvatar
              userId={item.userId}
              badgeContent={reactionsInfo[item.reactionType].icon}
              badgeColor={reactionsInfo[item.reactionType].color}
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

export default AudienceMeasurementReactionsModal;
