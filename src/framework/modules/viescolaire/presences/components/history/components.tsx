import * as React from 'react';
import { FlatList } from 'react-native';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { SmallText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import {
  AbsenceCard,
  DepartureCard,
  ForgottenNotebookCard,
  IncidentCard,
  LatenessCard,
  PunishmentCard,
  StatementAbsenceCard,
} from '~/framework/modules/viescolaire/presences/components/history-event-card/variants';
import HistoryPlaceholder from '~/framework/modules/viescolaire/presences/components/placeholders/history';
import {
  Absence,
  CommonEvent,
  Event,
  EventType,
  ForgottenNotebook,
  Incident,
  Punishment,
} from '~/framework/modules/viescolaire/presences/model';

import styles from './styles';
import { HistoryProps } from './types';

const History = (props: HistoryProps) => {
  const renderHistoryEventListItem = ({ item }: { item: Event }) => {
    switch (item.type) {
      case EventType.NO_REASON:
      case EventType.REGULARIZED:
      case EventType.UNREGULARIZED:
        return <AbsenceCard event={item as CommonEvent} />;
      case EventType.DEPARTURE:
        return <DepartureCard event={item as CommonEvent} />;
      case EventType.FORGOTTEN_NOTEBOOK:
        return <ForgottenNotebookCard event={item as ForgottenNotebook} />;
      case EventType.INCIDENT:
        return <IncidentCard event={item as Incident} />;
      case EventType.LATENESS:
        return <LatenessCard event={item as CommonEvent} />;
      case EventType.PUNISHMENT:
        return <PunishmentCard event={item as Punishment} />;
      case EventType.STATEMENT_ABSENCE:
        return <StatementAbsenceCard event={item as Absence} userType={props.userType} />;
    }
  };

  if (props.isRefreshing) return <HistoryPlaceholder />;
  return (
    <FlatList
      data={props.events}
      keyExtractor={item => `${item.id}-${item.type}`}
      renderItem={renderHistoryEventListItem}
      ListHeaderComponent={
        props.events.length ? (
          <SmallText style={styles.headingText}>
            {I18n.get(
              props.userType === AccountType.Relative
                ? 'presences-history-description-relative'
                : 'presences-history-description-student',
            )}
          </SmallText>
        ) : null
      }
      ListEmptyComponent={
        <EmptyScreen
          svgImage="empty-zimbra"
          title={I18n.get('presences-history-emptyscreen-default-title')}
          text={I18n.get(
            props.userType === AccountType.Relative
              ? 'presences-history-emptyscreen-default-text-relative'
              : 'presences-history-emptyscreen-default-text-student',
          )}
          customStyle={styles.emptyScreenContainer}
          customTitleStyle={styles.emptyScreenTitle}
        />
      }
      alwaysBounceVertical={false}
      contentContainerStyle={styles.listContentContainer}
    />
  );
};

export default React.memo(History);
