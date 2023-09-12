import moment, { Moment } from 'moment';
import * as React from 'react';
import { ColorValue, FlatList, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { BodyText, HeadingXLText, NestedBoldText, SmallText } from '~/framework/components/text';
import HistoryEventCard from '~/framework/modules/viescolaire/presences/components/history-event-card';
import {
  HistoryEventType,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IPunishment,
} from '~/framework/modules/viescolaire/presences/model';
import appConf from '~/framework/util/appConf';

import styles from './styles';
import { StatisticsCardProps } from './types';

const i18nCategories = {
  [HistoryEventType.DEPARTURE]: 'departures',
  [HistoryEventType.FORGOTTEN_NOTEBOOK]: 'forgottennotebooks',
  [HistoryEventType.INCIDENT]: 'incidents',
  [HistoryEventType.LATENESS]: 'latenesses',
  [HistoryEventType.NO_REASON]: 'noreason',
  [HistoryEventType.PUNISHMENT]: 'punishments',
  [HistoryEventType.REGULARIZED]: 'regularized',
  [HistoryEventType.STATEMENT_ABSENCE]: 'absences',
  [HistoryEventType.UNREGULARIZED]: 'unregularized',
};

export default function StatisticsCard(props: StatisticsCardProps) {
  const [isExpanded, setExpanded] = React.useState(false);
  const i18nCategory = i18nCategories[props.type];
  const displayedEvents = isExpanded ? props.events : props.events.slice(0, 2);

  const expand = () => setExpanded(!isExpanded);

  const renderEvent = (color: ColorValue, startDate: Moment, endDate: Moment) => {
    const isSingleDay = startDate.isSame(endDate, 'day');
    const format = moment().isSame(startDate, 'year') ? 'D MMMM' : 'D MMM YYYY';
    const time = isSingleDay
      ? appConf.is1d
        ? I18n.get(startDate.get('hour') < 12 ? 'presences-statistics-card-morning' : 'presences-statistics-card-afternoon')
        : startDate.format('H[h]mm') + ' - ' + endDate.format('H[h]mm')
      : null;

    return (
      <View style={styles.eventContainer}>
        <View style={[styles.eventBulletContainer, { backgroundColor: color }]} />
        <SmallText>
          <NestedBoldText>
            {isSingleDay
              ? startDate.format(format)
              : I18n.get('presences-statistics-card-dates', { start: startDate.format('D'), end: endDate.format(format) })}
          </NestedBoldText>
          {time ? ` (${time})` : null}
        </SmallText>
      </View>
    );
  };

  const renderSimpleEvent = (color: ColorValue, date: Moment, showTime?: boolean) => {
    const format = moment().isSame(date, 'year') ? 'D MMMM' : 'D MMM YYYY';

    return (
      <View style={styles.eventContainer}>
        <View style={[styles.eventBulletContainer, { backgroundColor: color }]} />
        <SmallText>
          <NestedBoldText>{date.format(format)}</NestedBoldText>
          {showTime ? date.format(' (H[h]mm)') : null}
        </SmallText>
      </View>
    );
  };

  const renderListItem = (item: IForgottenNotebook | IHistoryEvent | IIncident | IPunishment) => {
    switch (item.type) {
      case HistoryEventType.DEPARTURE:
        return renderEvent(
          theme.palette.complementary.pink.regular,
          (item as IHistoryEvent).startDate,
          (item as IHistoryEvent).endDate,
        );
      case HistoryEventType.FORGOTTEN_NOTEBOOK:
        return renderSimpleEvent(theme.palette.complementary.indigo.regular, (item as IForgottenNotebook).date);
      case HistoryEventType.INCIDENT:
        return renderSimpleEvent(theme.palette.grey.graphite, (item as IIncident).date, true);
      case HistoryEventType.LATENESS:
        return renderEvent(
          theme.palette.complementary.purple.regular,
          (item as IHistoryEvent).startDate,
          (item as IHistoryEvent).endDate,
        );
      case HistoryEventType.NO_REASON:
        return renderEvent(
          theme.palette.complementary.red.regular,
          (item as IHistoryEvent).startDate,
          (item as IHistoryEvent).endDate,
        );
      case HistoryEventType.PUNISHMENT:
        return renderSimpleEvent(theme.palette.complementary.yellow.regular, (item as IPunishment).createdAt, true);
      case HistoryEventType.REGULARIZED:
        return renderEvent(
          theme.palette.complementary.green.regular,
          (item as IHistoryEvent).startDate,
          (item as IHistoryEvent).endDate,
        );
      case HistoryEventType.STATEMENT_ABSENCE:
      case HistoryEventType.UNREGULARIZED:
        return renderEvent(
          theme.palette.complementary.orange.regular,
          (item as IHistoryEvent).startDate,
          (item as IHistoryEvent).endDate,
        );
    }
  };

  return (
    <HistoryEventCard type={props.type} style={styles.container}>
      <BodyText>{I18n.get(`presences-statistics-${i18nCategory}-title`)}</BodyText>
      <View style={styles.rowContainer}>
        <HeadingXLText>{props.events.length}</HeadingXLText>
        <FlatList
          data={displayedEvents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderListItem(item)}
          ListEmptyComponent={
            <SmallText style={styles.listEmptyText}>{I18n.get(`presences-statistics-${i18nCategory}-empty`)}</SmallText>
          }
          scrollEnabled={false}
        />
      </View>
      {props.events.length > 2 ? (
        <TertiaryButton
          text={I18n.get(isExpanded ? 'presences-statistics-card-showless' : 'presences-statistics-card-showmore')}
          action={expand}
          style={styles.showMoreButton}
        />
      ) : null}
    </HistoryEventCard>
  );
}
