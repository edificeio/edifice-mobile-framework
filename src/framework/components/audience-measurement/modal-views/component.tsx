import React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, HeadingMText } from '~/framework/components/text';

import styles from './styles';
import { AudienceMeasurementViewsModalProps } from './types';

const AudienceMeasurementViewsModal = (props: AudienceMeasurementViewsModalProps) => {
  const renderItem = ({ item }: { item: { nb: number; label: string; icon: string; color?: ColorValue; last?: boolean } }) => {
    return (
      <View style={[styles.item, item.last ? styles.lastItem : {}]}>
        <View style={[styles.icon, { backgroundColor: item.color ?? theme.palette.grey.pearl }]}>
          <NamedSVG
            name={item.icon}
            fill={item.color ? theme.palette.grey.white : theme.palette.grey.black}
            height={UI_SIZES.elements.icon.small}
            width={UI_SIZES.elements.icon.small}
          />
        </View>
        <HeadingMText style={styles.nb}>{item.nb}</HeadingMText>
        <BodyText>{item.label}</BodyText>
      </View>
    );
  };

  return (
    <PageView style={styles.container}>
      {renderItem({ item: { nb: 48, label: 'Vues totales', icon: 'ui-see' } })}
      {renderItem({ item: { nb: 23, label: 'Personnes ont vu le billet', icon: 'ui-users' } })}
      <View style={styles.subItems}>
        {renderItem({ item: { nb: 4, label: 'Élèves', icon: 'ui-backpack', color: theme.palette.complementary.orange.regular } })}
        {renderItem({
          item: { nb: 11, label: 'Parents', icon: 'ui-cottage', color: theme.palette.complementary.blue.regular, last: true },
        })}
      </View>
    </PageView>
  );
};

export default AudienceMeasurementViewsModal;
