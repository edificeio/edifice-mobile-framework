import React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { BadgeAvatar, BadgePosition } from '~/framework/components/badgeAvatar';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, CaptionBoldText, SmallText } from '~/framework/components/text';

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
        <SmallText>Tout</SmallText>
        {renderHeaderItem({ item: { icon: 'reaction-thankyou', nb: 12 } })}
        {renderHeaderItem({ item: { icon: 'reaction-awesome', nb: 4 } })}
        {renderHeaderItem({ item: { icon: 'reaction-welldone', nb: 23 } })}
        {renderHeaderItem({ item: { icon: 'reaction-instructive', nb: 1 } })}
      </View>
    );
  };
  return (
    <PageView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeaderList}
        data={[1, 2, 3]}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <BadgeAvatar
              userId="0afae690-7a12-4419-bbb5-ae6ebaed4fe0"
              badgeContent="reaction-thankyou"
              badgeColor={theme.palette.complementary.blue.pale}
              badgePosition={BadgePosition.bottom}
            />
            <View>
              <BodyText>Carpentier Lucie</BodyText>
              <CaptionBoldText>Élève</CaptionBoldText>
            </View>
          </View>
        )}
      />
    </PageView>
  );
};

export default AudienceMeasurementReactionsModal;
