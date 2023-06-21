import React from 'react';
import { ColorValue, FlatList, StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Card } from '~/framework/components/card/base';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import {
  BodyText,
  CaptionText,
  HeadingLText,
  NestedBoldText,
  NestedText,
  SmallBoldText,
  SmallText,
} from '~/framework/components/text';
import { IForgottenNotebook, IHistoryEvent, IIncident, IPunishment } from '~/framework/modules/viescolaire/presences/model';

const styles = StyleSheet.create({
  container: {
    marginBottom: UI_SIZES.spacing.medium,
    borderBottomWidth: 12,
  },
  emptyEventsText: {
    alignSelf: 'center',
    color: theme.palette.grey.grey,
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.tiny,
  },
  eventListContainer: {
    flex: 2,
    justifyContent: 'center',
    marginLeft: UI_SIZES.spacing.minor,
  },
  recoveryText: {
    color: theme.ui.text.light,
    textAlign: 'center',
  },
  showMoreText: {
    alignSelf: 'flex-end',
  },
  titleText: {
    color: theme.ui.text.light,
    textTransform: 'uppercase',
  },
  totalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface IHistoryCategoryCardProps {
  color: ColorValue;
  events: any[];
  title: string;
  total: number;
  recoveryMethod?: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
  renderEvent?: (item: IHistoryEvent | IForgottenNotebook | IIncident | IPunishment) => React.JSX.Element;
}

export const HistoryCategoryCard = (props: IHistoryCategoryCardProps) => {
  const [isExpanded, setExpanded] = React.useState(false);
  const displayedEvents = isExpanded ? props.events : props.events.slice(0, 2);

  const getRecoveryText = (method: 'DAY' | 'HALF_DAY' | 'HOUR'): string => {
    switch (method) {
      case 'DAY':
        return I18n.get('presences-history-categorycard-groupedby-day');
      case 'HALF_DAY':
        return I18n.get('presences-history-categorycard-groupedby-halfday');
      case 'HOUR':
        return I18n.get('presences-history-categorycard-groupedby-hour');
      default:
        return '';
    }
  };

  const renderChild = (item: any) => {
    return (
      <View style={styles.eventContainer}>
        <CaptionText style={{ color: props.color }}>{'\u25A0 '}</CaptionText>
        {props.renderEvent ? props.renderEvent(item) : renderEventDefault(item)}
      </View>
    );
  };

  const renderShowMore = () => (
    <SmallText onPress={() => setExpanded(!isExpanded)} style={styles.showMoreText}>
      {I18n.get(isExpanded ? 'presences-history-categorycard-showless' : 'presences-history-categorycard-showmore')}
      <NestedBoldText>{isExpanded ? ' -' : ' +'}</NestedBoldText>
    </SmallText>
  );

  return (
    <Card style={[styles.container, { borderBottomColor: props.color }]}>
      <BodyText style={styles.titleText}>{props.title}</BodyText>
      <View style={UI_STYLES.row}>
        <View style={styles.totalContainer}>
          <HeadingLText>{props.total}</HeadingLText>
          {props.recoveryMethod ? (
            <CaptionText style={styles.recoveryText}>{getRecoveryText(props.recoveryMethod)}</CaptionText>
          ) : null}
        </View>
        <FlatList
          data={displayedEvents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderChild(item)}
          ListEmptyComponent={
            <SmallText style={styles.emptyEventsText}>{I18n.get('presences-history-categorycard-empty')}</SmallText>
          }
          ListFooterComponent={props.events.length > 2 ? renderShowMore() : null}
          scrollEnabled={false}
          style={styles.eventListContainer}
        />
      </View>
    </Card>
  );
};

const renderEventDefault = (event: IHistoryEvent) => {
  return (
    <SmallText>
      <NestedBoldText>{event.startDate.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.startDate.format('HH:mm') + ' - ' + event.endDate.format('HH:mm')}
    </SmallText>
  );
};

export const renderLateness = (event: IHistoryEvent) => {
  return (
    <SmallText>
      <NestedBoldText>{event.startDate.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.endDate.format('HH:mm')}
      <NestedBoldText>{` - ${event.endDate.diff(event.startDate, 'minutes')}mn`}</NestedBoldText>
    </SmallText>
  );
};

export const renderDeparture = (event: IHistoryEvent) => {
  return (
    <SmallText>
      <NestedBoldText>{event.startDate.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.startDate.format('HH:mm')}
      <NestedBoldText>{` - ${Math.abs(event.startDate.diff(event.endDate, 'minutes'))}mn`}</NestedBoldText>
    </SmallText>
  );
};

export const renderForgottenNotebook = (event: IForgottenNotebook) => {
  return <SmallBoldText>{event.date.format('DD/MM/YY')}</SmallBoldText>;
};

export const renderIncident = (event: IIncident) => {
  return (
    <SmallText>
      <NestedText>{event.label}</NestedText>
      <SmallText> - </SmallText>
      <NestedBoldText>{event.date.format('DD/MM/YY HH:mm')}</NestedBoldText>
      {' - ' + event.protagonist.label}
    </SmallText>
  );
};

export const renderPunishment = (event: IPunishment) => {
  const getPunishmentDate = (punishment: IPunishment) => {
    const createdDate: string = punishment?.createdAt.format('DD/MM/YY');
    switch (punishment.punishmentCategoryId) {
      case 1: {
        //DUTY
        let dutyDate: string = createdDate;
        if (punishment.delayAt) {
          dutyDate = punishment.delayAt.format('DD/MM/YY');
        }
        return I18n.get('presences-history-categorycard-for', { date: dutyDate });
      }
      case 2: {
        //DETENTION
        let startDetentionDate: string = createdDate;
        let endDetentionDate: string = '';
        if (punishment.startDate) {
          startDetentionDate = punishment.startDate.format('DD/MM/YY - HH:mm');
        }
        if (punishment.endDate) {
          endDetentionDate = punishment.endDate.format('HH:mm');
        }
        return (
          I18n.get('presences-history-categorycard-for', { date: startDetentionDate }) +
          (endDetentionDate ? ` - ${endDetentionDate}` : null)
        );
      }
      case 3: //BLAME
        return I18n.get('presences-history-categorycard-created', { date: createdDate });
      case 4: // EXCLUSION
        if (punishment.startDate && punishment.endDate) {
          const startExcludeDate: string = punishment.startDate.format('DD/MM/YY');
          const endExcludeDate: string = punishment.endDate.format('DD/MM/YY');
          if (startExcludeDate && endExcludeDate) {
            return startExcludeDate === endExcludeDate
              ? startExcludeDate
              : I18n.get('presences-history-categorycard-dates', { start: startExcludeDate, end: endExcludeDate });
          } else {
            return ' ';
          }
        }
        break;
      default:
        return createdDate;
    }
  };

  return (
    <SmallText>
      <NestedBoldText>{event.label + ' - '}</NestedBoldText>
      {getPunishmentDate(event)}
    </SmallText>
  );
};
