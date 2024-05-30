import React from 'react';
import { ColorValue, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, HeadingMText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';

import styles from './styles';
import { AudienceViewsModalProps } from './types';

const AudienceViewsModal = (props: AudienceViewsModalProps) => {
  const renderItem = ({
    nb,
    label,
    icon,
    color,
    last,
  }: {
    nb: number;
    label: string;
    icon: string;
    color?: ColorValue;
    last?: boolean;
  }) => {
    return (
      <View style={[styles.item, last ? styles.lastItem : {}]}>
        <View style={[styles.icon, { backgroundColor: color ?? theme.palette.grey.pearl }]}>
          <NamedSVG
            name={icon}
            fill={color ? theme.palette.grey.white : theme.palette.grey.black}
            height={UI_SIZES.elements.icon.small}
            width={UI_SIZES.elements.icon.small}
          />
        </View>
        <HeadingMText style={styles.nb}>{nb}</HeadingMText>
        <BodyText>{label}</BodyText>
      </View>
    );
  };

  return (
    <PageView style={styles.container}>
      {renderItem({ nb: props.nbViews, label: I18n.get('audience-views-views'), icon: 'ui-see' })}
      {renderItem({ nb: props.nbUniqueViews, label: I18n.get('audience-views-uniqueviews'), icon: 'ui-users' })}
      <View style={styles.subItems}>
        {props.viewsPerProfile.map((item, index) =>
          renderItem({
            nb: item.counter,
            label: I18n.get(`user-profiletypes-${item.profile.toLocaleLowerCase()}`),
            icon: item.profile === AccountType.Student ? 'ui-backpack' : 'ui-cottage',
            color:
              item.profile === AccountType.Student
                ? theme.palette.complementary.orange.regular
                : theme.palette.complementary.blue.regular,
            last: index === props.viewsPerProfile.length - 1,
          }),
        )}
      </View>
    </PageView>
  );
};

export default AudienceViewsModal;
