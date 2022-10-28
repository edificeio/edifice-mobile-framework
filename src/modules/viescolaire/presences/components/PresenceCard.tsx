import I18n from 'i18n-js';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import {
  BodyText,
  HeadingXLText,
  NestedBoldText,
  NestedText,
  SmallBoldText,
  SmallText,
  TextSizeStyle,
} from '~/framework/components/text';
import { BottomColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { IPunishment } from '~/modules/viescolaire/presences/state/events';

interface PresenceCardProps {
  color: string;
  title: string;
  subNumber?: string;
  elements: any[];
  renderItem: (item: any) => React.ReactElement;
}

const styles = StyleSheet.create({
  title: {
    textTransform: 'uppercase',
    color: theme.palette.grey.graphite,
  },
  row: { flexDirection: 'row' },
  leftColumn: { width: '30%', alignItems: 'center' },
  itemContainer: { flex: 1 },
  itemView: { flex: 1, justifyContent: 'center' },
  childText: { marginVertical: UI_SIZES.spacing.tiny },
  childNestedText: {
    ...TextSizeStyle.Small,
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
      <SmallText style={styles.childText}>
        <NestedText style={[styles.childNestedText, { color }]}>{'\u25A0 '}</NestedText>
        {renderItem(item)}
      </SmallText>
    );
  };

  const renderMore = () => (
    <SmallText onPress={() => setExpanded(!expanded)} style={styles.itemMoretext}>
      {expanded ? (
        <>
          {I18n.t('seeLess') + ' '}
          <SmallBoldText>-</SmallBoldText>
        </>
      ) : (
        <>
          {I18n.t('seeMore') + ' '}
          <SmallBoldText>+</SmallBoldText>
        </>
      )}
    </SmallText>
  );

  return (
    <BottomColoredItem shadow color={color}>
      <BodyText style={styles.title}>{title}</BodyText>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <HeadingXLText>{numberChildren}</HeadingXLText>
          {subNumber && <SmallText>{subNumber}</SmallText>}
        </View>
        <View style={styles.itemContainer}>
          {numberChildren !== 0 ? (
            displayedElements.map(renderChild)
          ) : (
            <View style={styles.itemView}>
              <SmallText style={styles.itemText}>{I18n.t('viesco-empty-card')}</SmallText>
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
    <SmallText>
      <NestedBoldText>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.start_date.format('HH:mm') + ' - ' + event.end_date.format('HH:mm')}
    </SmallText>
  );
  return (
    <PresenceCard
      color={viescoTheme.palette.presencesEvents.noReason}
      title={I18n.t('viesco-history-noreason')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const UnregularizedCard = ({ elements }) => {
  const renderItem = event => (
    <SmallText>
      <NestedBoldText>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.start_date.format('HH:mm') + ' - ' + event.end_date.format('HH:mm')}
    </SmallText>
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
    <SmallText>
      <NestedBoldText>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.start_date.format('HH:mm') + ' - ' + event.end_date.format('HH:mm')}
    </SmallText>
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
    <SmallText>
      <NestedBoldText>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.end_date.format('HH:mm')}
      <NestedBoldText>{' - ' + event.end_date.diff(event.start_date, 'minutes') + 'mn'}</NestedBoldText>
    </SmallText>
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
    <SmallText>
      <NestedBoldText>{' ' + event.start_date.format('DD/MM/YY') + ' - '}</NestedBoldText>
      {event.start_date.format('HH:mm')}
      <NestedBoldText>{' - ' + Math.abs(event.start_date.diff(event.end_date, 'minutes')) + 'mn'}</NestedBoldText>
    </SmallText>
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
  const renderItem = event => <SmallBoldText>{' ' + event.date.format('DD/MM/YY')}</SmallBoldText>;
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
    <SmallText>
      <NestedText>{' ' + event.label}</NestedText>
      <SmallText> - </SmallText>
      <NestedBoldText>{event.date.format('DD/MM/YY HH:mm')}</NestedBoldText>
      {' - ' + event.protagonist.label}
    </SmallText>
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
          startDetentionDate = punishment.start_date.format('DD/MM/YY - HH:mm');
        }
        if (punishment.end_date) {
          endDetentionDate = punishment.end_date.format('HH:mm');
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
    <SmallText>
      <NestedBoldText>{' ' + event.label + ' - '}</NestedBoldText>
      {getPunishmentDate(event)}
    </SmallText>
  );

  return (
    <PresenceCard
      color={viescoTheme.palette.presences}
      title={I18n.t('viesco-history-punishments')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};
