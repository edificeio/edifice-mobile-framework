import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { ICourses } from '~/modules/viescolaire/presences/state/teacherCourses';
import { BottomColoredItem } from '~/modules/viescolaire/viesco/components/Item';

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
  itemContent: { flex: 1, padding: 15, justifyContent: 'space-evenly' },
  itemRowStyle: { flexDirection: 'row' },
  iconMarginRight: { marginRight: 10 },
  itemClassGroupText: {
    ...TextSizeStyle.Big,
  },
});

export default ({
  item,
  onPress,
  isCourseNow,
  isCourseEditable,
}: {
  item: ICourses;
  onPress: () => any;
  isCourseNow: boolean;
  isCourseEditable: boolean;
}) => (
  <BottomColoredItem
    shadow={isCourseNow}
    disabled={!isCourseEditable}
    onPress={onPress}
    style={[styles.itemContainer, isCourseNow ? styles.itemContainerOpacityFull : styles.itemContainerOpacityScaledDown]}
    color={isCourseEditable ? '#FFB600' : 'dimgrey'}>
    <ImageBackground
      source={isCourseEditable ? require('ASSETS/viesco/presences.png') : require('ASSETS/viesco/presence_gris.png')}
      style={styles.imageBackgroundContainer}
      imageStyle={styles.imageBackground}
      resizeMode="contain">
      <View style={styles.itemContent}>
        <View style={styles.itemRowStyle}>
          <Icon style={styles.iconMarginRight} size={20} name="access_time" />
          <Text>
            {moment(item.startDate).format('LT')} - {moment(item.endDate).format('LT')}
          </Text>
        </View>
        <TextBold style={styles.itemClassGroupText}>{item.classes[0] !== undefined ? item.classes : item.groups}</TextBold>

        {item.roomLabels[0] !== '' && (
          <View style={styles.itemRowStyle}>
            <Icon style={styles.iconMarginRight} size={20} name="pin_drop" />
            <Text>
              {I18n.t('viesco-room')} {item.roomLabels}
            </Text>
          </View>
        )}
      </View>
    </ImageBackground>
  </BottomColoredItem>
);
