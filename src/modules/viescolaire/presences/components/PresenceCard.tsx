import I18n from 'i18n-js';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { NestedText, NestedTextBold, Text, TextBold, TextSizeStyle, responsiveStyle } from '~/framework/components/text';
import { BottomColoredItem } from '~/modules/viescolaire/viesco/components/Item';

import { viescoTheme } from '../../viesco/utils/viescoTheme';
import { IPunishment } from '../state/events';

interface PresenceCardProps {
  color: string;
  title: string;
  subNumber?: string;
  elements: any[];
  renderItem: (item: any) => React.ReactElement;
}

const styles = StyleSheet.create({
  title: {
    ...TextSizeStyle.SlightBig,
    textTransform: 'uppercase',
    color: theme.palette.grey.graphite,
  },
  row: { flexDirection: 'row' },
  leftColumn: { width: '30%', alignItems: 'center' },
  leftColumnText: {
    ...responsiveStyle(48),
  },
  itemContainer: { flex: 1 },
  itemView: { flex: 1, justifyContent: 'center' },
  childText: { marginVertical: 2 },
  childNestedText: {
    ...TextSizeStyle.Tiny,
  },
  itemText: {
    alignSelf: 'center',
    color: theme.palette.grey.grey,
  },
  itemMoretext: { alignSelf: 'flex-end' },
});

const PresenceCard: React.FunctionComponent<PresenceCardProps> = ({ color, title, elements = [], subNumber, renderItem }) => {
  const [expanded, setExpanded] = useState(false);

  const numberChildren = elements.length;
  const displayedElements = expanded ? elements : elements.slice(0, 2);

  const renderChild = item => {
    return (
      <Text style={styles.childText}>
        <NestedText style={[styles.childNestedText, { color }]}>{'\u25A0 '}</NestedText>
        {renderItem(item)}
      </Text>
    );
  };

  const renderMore = () => (
    <Text onPress={() => setExpanded(!expanded)} style={styles.itemMoretext}>
      {expanded ? (
        <>
          {I18n.t('seeLess') + ' '}
          <TextBold>-</TextBold>
        </>
      ) : (
        <>
          {I18n.t('seeMore') + ' '}
          <TextBold>+</TextBold>
        </>
      )}
    </Text>
  );

  return (
    <BottomColoredItem shadow color={color}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <NestedTextBold style={styles.leftColumnText}>{numberChildren}</NestedTextBold>
          {subNumber && <Text>{subNumber}</Text>}
        </View>
        <View style={styles.itemContainer}>
          {numberChildren !== 0 ? (
            displayedElements.map(renderChild)
          ) : (
            <View style={styles.itemView}>
              <Text style={styles.itemText}>{I18n.t('viesco-empty-card')}</Text>
            </View>
          )}
          {numberChildren > 2 && renderMore()}
        </View>
      </View>
    </BottomColoredItem>
  );
};

export const NoReasonCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedTextBold>
      {event.start_date.format('H:mm') + ' - ' + event.end_date.format('H:mm')}
    </Text>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.no_reason}
      title={I18n.t('viesco-history-noreason')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const UnregularizedCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedTextBold>
      {event.start_date.format('H:mm') + ' - ' + event.end_date.format('H:mm')}
    </Text>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.unregularized}
      title={I18n.t('viesco-history-unregularized')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const RegularizedCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedTextBold>
      {event.start_date.format('H:mm') + ' - ' + event.end_date.format('H:mm')}
    </Text>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.regularized}
      title={I18n.t('viesco-history-regularized')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const LatenessCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedTextBold>
      {event.end_date.format('H:mm')}
      <NestedTextBold>{' - ' + event.end_date.diff(event.start_date, 'minutes') + 'mn'}</NestedTextBold>
    </Text>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.lateness}
      title={I18n.t('viesco-history-latenesses')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const DepartureCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedTextBold>
      {event.start_date.format('H:mm')}
      <NestedTextBold>{' - ' + Math.abs(event.start_date.diff(event.end_date, 'minutes')) + 'mn'}</NestedTextBold>
    </Text>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.departure}
      title={I18n.t('viesco-history-departures')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const ForgotNotebookCard = ({ elements }) => {
  const renderItem = event => <TextBold>{' ' + event.date.format('DD/MM/YY')}</TextBold>;
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.forgotNotebook}
      title={I18n.t('viesco-history-forgotten-notebooks')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const IncidentCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedText>{' ' + event.label}</NestedText>
      <Text> - </Text>
      <NestedTextBold>{event.date.format('DD/MM/YY H:mm')}</NestedTextBold>
      {' - ' + event.protagonist.label}
    </Text>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.incident}
      title={I18n.t('viesco-history-incidents')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const PunishmentCard = ({ elements }) => {
  const getPunishmentDate = (punishment: IPunishment) => {
    const createdDate: string = punishment?.created_at.format('DD/MM/YY');
    switch (punishment.punishment_category_id) {
      case 1: {
        //DUTY
        let dutyDate: string = createdDate;
        if (punishment.delay_at) {
          dutyDate = punishment.delay_at.format('DD/MM/YY');
        }
        return I18n.t('viesco-incidents-punishments-date.for-the') + dutyDate;
      }
      case 2: {
        //DETENTION
        let startDetentionDate: string = createdDate;
        let endDetentionDate: string = '';
        if (punishment.start_date) {
          startDetentionDate = punishment.start_date.format('DD/MM/YY - H:mm');
        }
        if (punishment.end_date) {
          endDetentionDate = punishment.end_date.format('H:mm');
        }
        return (
          I18n.t('viesco-incidents-punishments-date.for-the') +
          startDetentionDate +
          (endDetentionDate !== '' ? ' - ' + endDetentionDate : null)
        );
      }
      case 3: //BLAME
        return I18n.t('viesco-incidents-punishments-date.created-on') + createdDate;
      case 4: // EXCLUSION
        if (punishment.start_date && punishment.end_date) {
          const startExcludeDate: string = punishment.start_date.format('DD/MM/YY');
          const endExcludeDate: string = punishment.end_date.format('DD/MM/YY');
          if (startExcludeDate && endExcludeDate) {
            return startExcludeDate === endExcludeDate
              ? startExcludeDate
              : I18n.t('viesco-incidents-punishments-date.from') +
                  startExcludeDate +
                  I18n.t('viesco-incidents-punishments-date.to') +
                  endExcludeDate;
          } else {
            return ' ';
          }
        }
        break;
      default:
        return createdDate;
    }
  };

  const renderItem = (event: IPunishment) => (
    <Text>
      <NestedTextBold>{' ' + event.label + ' - '}</NestedTextBold>
      {getPunishmentDate(event)}
    </Text>
  );

  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.punishment}
      title={I18n.t('viesco-history-punishments')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};
