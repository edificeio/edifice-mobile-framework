import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingSText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { BottomColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { ICourse } from '~/framework/modules/viescolaire/presences/model';

const styles = StyleSheet.create({
  itemContainer: { flex: 1, padding: 0 },
  itemContainerOpacityFull: { opacity: 1 },
  itemContainerOpacityScaledDown: { opacity: 0.4 },
  imageBackgroundContainer: { flex: 1, overflow: 'hidden' },
  imageBackground: {
    height: '100%',
    width: '100%',
    right: undefined,
    bottom: undefined,
    top: '20%',
    left: '30%',
  },
  itemContent: { flex: 1, padding: UI_SIZES.spacing.medium, justifyContent: 'space-evenly' },
  itemRowStyle: { flexDirection: 'row', alignItems: 'center' },
  iconMarginRight: { marginRight: UI_SIZES.spacing.minor },
});

export default ({
  item,
  onPress,
  isCourseNow,
  isCourseEditable,
  style,
}: {
  item: ICourse;
  onPress: () => any;
  isCourseNow: boolean;
  isCourseEditable: boolean;
  style?: ViewStyle;
}) => (
  <BottomColoredItem
    shadow={isCourseNow}
    disabled={!isCourseEditable}
    onPress={onPress}
    style={[styles.itemContainer, isCourseNow ? styles.itemContainerOpacityFull : styles.itemContainerOpacityScaledDown, style]}
    color={isCourseEditable ? viescoTheme.palette.presences : theme.palette.grey.graphite}>
    <ImageBackground
      source={isCourseEditable ? require('ASSETS/viesco/presences.png') : require('ASSETS/viesco/presence_gris.png')}
      style={styles.imageBackgroundContainer}
      imageStyle={styles.imageBackground}
      resizeMode="contain">
      <View style={styles.itemContent}>
        <View style={styles.itemRowStyle}>
          <Picture
            type="NamedSvg"
            name="ui-clock"
            width={20}
            height={20}
            fill={theme.ui.text.regular}
            style={styles.iconMarginRight}
          />
          <SmallText>
            {moment(item.startDate).format('LT')} - {moment(item.endDate).format('LT')}
          </SmallText>
        </View>
        <HeadingSText>{item.classes[0] !== undefined ? item.classes : item.groups}</HeadingSText>

        {item.roomLabels[0] !== '' && (
          <View style={styles.itemRowStyle}>
            <Icon style={styles.iconMarginRight} size={20} name="pin_drop" />
            <SmallText>
              {I18n.t('viesco-room')} {item.roomLabels}
            </SmallText>
          </View>
        )}
      </View>
    </ImageBackground>
  </BottomColoredItem>
);
