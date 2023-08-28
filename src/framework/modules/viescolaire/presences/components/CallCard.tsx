import moment, { Moment } from 'moment';
import React from 'react';
import { ColorValue, StyleSheet, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { BodyText, HeadingSText } from '~/framework/components/text';
import { ICourse } from '~/framework/modules/viescolaire/presences/model';
import appConf from '~/framework/util/appConf';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.card,
    overflow: 'hidden',
  },
  leftContainer: {
    flexShrink: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    rowGap: UI_SIZES.spacing.minor,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
  roomContainer: {
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.minor,
  },
  roomText: {
    color: theme.ui.text.light,
  },
  statusContainer: {
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
  },
});

interface CallCardProps {
  course: ICourse;
  disabled?: boolean;
  onPress?: () => void;
}

interface CallCardStyle {
  borderColor: ColorValue;
  borderWidth: number;
  status: {
    backgroundColor: ColorValue;
    iconColor: ColorValue;
    iconName: string;
  };
  textColor: ColorValue;
}

export class CallCard extends React.PureComponent<CallCardProps> {
  private getStatusStyle(): CallCardStyle {
    const { course } = this.props;
    const now = moment();
    const isValidated = course.registerStateId === 3;

    if (now.isAfter(course.endDate)) {
      return {
        borderColor: isValidated ? theme.palette.status.success.pale : theme.palette.status.warning.pale,
        borderWidth: 1,
        status: {
          backgroundColor: isValidated ? theme.palette.status.success.pale : theme.palette.status.warning.pale,
          iconColor: isValidated ? theme.palette.status.success.regular : theme.palette.status.warning.regular,
          iconName: isValidated ? 'ui-forgoing-check' : 'ui-forgoing-error',
        },
        textColor: theme.ui.text.regular,
      };
    } else if (now.isBetween(course.startDate, course.endDate)) {
      return {
        borderColor: isValidated ? theme.palette.status.success.regular : theme.palette.status.info.regular,
        borderWidth: 2,
        status: {
          backgroundColor: isValidated ? theme.palette.status.success.pale : theme.palette.status.info.pale,
          iconColor: isValidated ? theme.palette.status.success.regular : theme.palette.status.info.regular,
          iconName: isValidated ? 'ui-check' : 'presences',
        },
        textColor: theme.ui.text.regular,
      };
    }
    return {
      borderColor: theme.palette.grey.pearl,
      borderWidth: 1,
      status: {
        backgroundColor: theme.palette.grey.pearl,
        iconColor: theme.palette.grey.graphite,
        iconName: 'ui-upcoming',
      },
      textColor: theme.ui.text.light,
    };
  }

  private getHoursLabel(startDate: Moment, endDate: Moment): string {
    if (appConf.is1d) {
      return I18n.get(
        startDate.get('h') < 12 ? 'presences-courselist-callcard-morning' : 'presences-courselist-callcard-afternoon',
      );
    } else {
      return `${startDate.format('LT')} - ${endDate.format('LT')}`;
    }
  }

  public render() {
    const { course: call, disabled, onPress } = this.props;
    const hoursLabel = this.getHoursLabel(call.startDate, call.endDate);
    const roomLabel = call.roomLabels[0];
    const classLabel = call.classes.length ? call.classes : call.groups;
    const { borderColor, borderWidth, status, textColor } = this.getStatusStyle();

    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.container, { borderColor, borderWidth }]}>
        <View style={styles.leftContainer}>
          <View style={styles.rowContainer}>
            <Picture type="NamedSvg" name="ui-clock" width={22} height={22} fill={textColor} />
            <BodyText style={{ color: textColor }}>{appConf.is1d ? classLabel : hoursLabel}</BodyText>
            {roomLabel ? (
              <View style={styles.roomContainer}>
                <BodyText style={styles.roomText}>-</BodyText>
                <BodyText style={styles.roomText}>{I18n.get('presences-courselist-callcard-room', { name: roomLabel })}</BodyText>
              </View>
            ) : null}
          </View>
          <HeadingSText style={{ color: textColor }}>{appConf.is1d ? hoursLabel : classLabel}</HeadingSText>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: status.backgroundColor }]}>
          <Picture type="NamedSvg" name={status.iconName} width={32} height={32} fill={status.iconColor} />
        </View>
      </TouchableOpacity>
    );
  }
}
