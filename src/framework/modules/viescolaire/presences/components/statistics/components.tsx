import moment from 'moment';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { I18n } from '~/app/i18n';
import DropdownPicker from '~/framework/components/pickers/dropdown';
import { SmallText } from '~/framework/components/text';
import { ITerm } from '~/framework/modules/viescolaire/common/model';
import StatisticsPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/statistics';
import StatisticsCard from '~/framework/modules/viescolaire/presences/components/statistics-card';
import { Event, EventType } from '~/framework/modules/viescolaire/presences/model';
import { getPresencesWorkflowInformation } from '~/framework/modules/viescolaire/presences/rights';

import styles from './styles';
import { StatisticsProps } from './types';

const getDefaultSelectedTerm = (terms: ITerm[]): string => {
  const currentTerm = terms.find(term => moment().isBetween(term.startDate, term.endDate));
  return currentTerm?.order.toString() ?? 'year';
};

const Statistics = (props: StatisticsProps) => {
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectedTerm, setSelectedTerm] = React.useState(getDefaultSelectedTerm(props.terms));

  const getCountMethodText = (recoveryMethod: 'DAY' | 'HALF_DAY' | 'HOUR' | null): string => {
    switch (recoveryMethod) {
      case 'DAY':
        return I18n.get('presences-statistics-count-day');
      case 'HALF_DAY':
        return I18n.get('presences-statistics-count-halfday');
      case 'HOUR':
      default:
        return I18n.get('presences-statistics-count-hour');
    }
  };

  const filterEvents = (stats: { events: Event[] }) => {
    const term = selectedTerm !== 'year' ? props.terms.find(t => t.order.toString() === selectedTerm) : undefined;

    return {
      events: term
        ? stats.events.filter(e => {
            const date = 'startDate' in e ? e.startDate : e.date;
            return date.isSameOrAfter(term.startDate) && date.isSameOrBefore(term.endDate);
          })
        : stats.events,
      recoveryMethod: props.statistics.recoveryMethod,
    };
  };

  const { session, statistics, terms, openEventList } = props;

  if (props.isRefreshing) {
    if (isDropdownOpen) setDropdownOpen(false);
    return <StatisticsPlaceholder />;
  }
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {props.terms.length ? (
        <View style={styles.dropdownContainer}>
          <DropdownPicker
            open={isDropdownOpen}
            value={selectedTerm}
            items={[
              { label: I18n.get('presences-statistics-year'), value: 'year' },
              ...terms.map(term => ({
                label: `${I18n.get('presences-statistics-trimester')} ${term.order}`,
                value: term.order.toString(),
              })),
            ]}
            setOpen={setDropdownOpen}
            setValue={setSelectedTerm}
          />
        </View>
      ) : null}
      <SmallText style={styles.countMethodText}>{getCountMethodText(statistics.recoveryMethod)}</SmallText>
      <StatisticsCard type={EventType.NO_REASON} {...filterEvents(statistics.NO_REASON)} navigateToEventList={openEventList} />
      <StatisticsCard
        type={EventType.UNREGULARIZED}
        {...filterEvents(statistics.UNREGULARIZED)}
        navigateToEventList={openEventList}
      />
      <StatisticsCard type={EventType.REGULARIZED} {...filterEvents(statistics.REGULARIZED)} navigateToEventList={openEventList} />
      <SmallText style={styles.countMethodText}>{I18n.get('presences-statistics-count-occurence')}</SmallText>
      <StatisticsCard type={EventType.LATENESS} {...filterEvents(statistics.LATENESS)} navigateToEventList={openEventList} />
      <StatisticsCard type={EventType.DEPARTURE} {...filterEvents(statistics.DEPARTURE)} navigateToEventList={openEventList} />
      {session && getPresencesWorkflowInformation(session).presences2d ? (
        <>
          <StatisticsCard
            type={EventType.FORGOTTEN_NOTEBOOK}
            {...filterEvents(statistics.FORGOTTEN_NOTEBOOK!)}
            navigateToEventList={openEventList}
          />
          <StatisticsCard type={EventType.INCIDENT} {...filterEvents(statistics.INCIDENT!)} navigateToEventList={openEventList} />
          <StatisticsCard
            type={EventType.PUNISHMENT}
            {...filterEvents(statistics.PUNISHMENT!)}
            navigateToEventList={openEventList}
          />
        </>
      ) : null}
    </ScrollView>
  );
};

export default React.memo(Statistics);
