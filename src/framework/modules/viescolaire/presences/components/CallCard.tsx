import moment from 'moment';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingSText, SmallText } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { LeftColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { ICourse } from '~/framework/modules/viescolaire/presences/model';
import { ArticleContainer } from '~/ui/ContainerContent';

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
  course: ICourse;
  onPress: () => any;
}

export class CallCard extends React.PureComponent<ICallCardProps> {
  public render() {
    const { course, onPress } = this.props;
    const isCourseNow = moment().isBetween(moment(course.startDate).subtract(15, 'minutes'), moment(course.endDate));
    const isCourseEditable = !moment(course.startDate).subtract(15, 'minutes').isAfter(moment());
    const opacity = isCourseNow ? 1 : 0.4;
    const hoursText = `${moment(course.startDate).format('LT')} - ${moment(course.endDate).format('LT')}`;
    return (
      <ArticleContainer>
        <LeftColoredItem
          onPress={onPress}
          disabled={!isCourseEditable}
          color={isCourseEditable ? viescoTheme.palette.presences : theme.palette.grey.graphite}
          style={[styles.mainContainer, { opacity }]}
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
                    <SmallText>{I18n.get('presences-courselist-callcard-room', { name: course.roomLabels[0] })}</SmallText>
                  </View>
                ) : null}
              </View>
              <HeadingSText>{course.classes[0] !== undefined ? course.classes : course.groups}</HeadingSText>
            </View>
          </ImageBackground>
        </LeftColoredItem>
      </ArticleContainer>
    );
  }
}
