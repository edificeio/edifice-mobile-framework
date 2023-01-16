import I18n from 'i18n-js';
import moment from 'moment';
import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { ICourses } from '~/modules/viescolaire/presences/state/teacherCourses';

const styles = StyleSheet.create({
  mainContainer: {
    padding: 0,
  },
  backgroundContainer: {
    overflow: 'hidden',
  },
  backgroundImage: {
    width: 80,
    height: 80,
    top: '20%',
    left: '75%',
  },
  itemContent: {
    justifyContent: 'space-evenly',
    padding: UI_SIZES.spacing.minor,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMarginRight: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: UI_SIZES.spacing.large,
  },
});

interface ICallCardProps {
  course: ICourses;
  style?: ViewStyle;
  onPress: () => any;
}

export class CallCard extends React.PureComponent<ICallCardProps> {
  public render() {
    const { course, onPress, style } = this.props;
    const isCourseNow = moment().isBetween(moment(course.startDate).subtract(15, 'minutes'), moment(course.endDate));
    const isCourseEditable = !moment(course.startDate).subtract(15, 'minutes').isAfter(moment());
    const opacity = isCourseNow ? 1 : 0.4;
    const hoursText = `${moment(course.startDate).format('LT')} - ${moment(course.endDate).format('LT')}`;
    const roomText = `${I18n.t('viesco-room')} ${course.roomLabels}`;
    return (
      <LeftColoredItem
        onPress={onPress}
        disabled={!isCourseEditable}
        color={isCourseEditable ? viescoTheme.palette.presences : theme.palette.grey.graphite}
        style={[styles.mainContainer, { opacity }, style]}
        shadow>
        <ImageBackground
          source={isCourseEditable ? require('ASSETS/viesco/presences.png') : require('ASSETS/viesco/presence_gris.png')}
          style={styles.backgroundContainer}
          imageStyle={styles.backgroundImage}>
          <View style={styles.itemContent}>
            <View style={styles.rowContainer}>
              <Picture
                type="NamedSvg"
                name="ui-clock"
                width={20}
                height={20}
                fill={theme.ui.text.regular}
                style={styles.iconMarginRight}
              />
              <SmallText>{hoursText}</SmallText>
              {course.roomLabels[0] !== '' ? (
                <View style={styles.roomContainer}>
                  <Icon style={styles.iconMarginRight} size={20} name="pin_drop" />
                  <SmallText>{roomText}</SmallText>
                </View>
              ) : null}
            </View>
            <HeadingSText>{course.classes[0] !== undefined ? course.classes : course.groups}</HeadingSText>
          </View>
        </ImageBackground>
      </LeftColoredItem>
    );
  }
}
