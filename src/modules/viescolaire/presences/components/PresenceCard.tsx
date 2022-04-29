import I18n from 'i18n-js';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NestedText, NestedTextBold, Text, TextBold } from '~/framework/components/text';
import { BottomColoredItem } from '~/modules/viescolaire/viesco/components/Item';

import { IPunishment } from '../state/events';

export const colors = {
  no_reason: '#E61610',
  unregularized: '#FA8A85',
  regularized: '#72bb53',
  lateness: '#9C29B7',
  departure: '#eD9FFD',
  forgotNotebook: '#B0EAD5',
  incident: '#D6D6D6',
  punishment: '#FCB602',
};

interface PresenceCardProps {
  color: string;
  title: string;
  subNumber?: string;
  elements: any[];
  renderItem: (item: any) => React.ReactElement;
}

const style = StyleSheet.create({
  title: {
    fontSize: 16,
    textTransform: 'uppercase',
    color: 'gray',
  },
  leftColumn: { width: '30%', alignItems: 'center' },
});

const PresenceCard: React.FunctionComponent<PresenceCardProps> = ({ color, title, elements = [], subNumber, renderItem }) => {
  const [expanded, setExpanded] = useState(false);

  const numberChildren = elements.length;
  const displayedElements = expanded ? elements : elements.slice(0, 2);

  const renderChild = item => {
    return (
      <Text style={{ marginVertical: 2 }}>
        <NestedText style={{ color, fontSize: 10 }}>{'\u25A0 '}</NestedText>
        {renderItem(item)}
      </Text>
    );
  };

  const renderMore = () => (
    <Text onPress={() => setExpanded(!expanded)} style={{ alignSelf: 'flex-end' }}>
      {expanded ? (
        <>
          {I18n.t('seeLess')} <TextBold>-</TextBold>
        </>
      ) : (
        <>
          {I18n.t('seeMore')} <TextBold>+</TextBold>
        </>
      )}
    </Text>
  );

  return (
    <BottomColoredItem shadow color={color}>
      <Text style={style.title}>{title}</Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={style.leftColumn}>
          <NestedTextBold style={{ fontSize: 48 }}>{numberChildren}</NestedTextBold>
          {subNumber && <Text>{subNumber}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          {numberChildren !== 0 ? (
            displayedElements.map(renderChild)
          ) : (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ alignSelf: 'center', color: 'grey' }}>{I18n.t('viesco-empty-card')}</Text>
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
      <NestedTextBold> {event.start_date.format('DD/MM/YY')} - </NestedTextBold>
      {event.start_date.format('H:mm')} - {event.end_date.format('H:mm')}
    </Text>
  );
  return (
    <PresenceCard color={colors.no_reason} title={I18n.t('viesco-history-noreason')} renderItem={renderItem} elements={elements} />
  );
};

export const UnregularizedCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format('DD/MM/YY')} - </NestedTextBold>
      {event.start_date.format('H:mm')} - {event.end_date.format('H:mm')}
    </Text>
  );
  return (
    <PresenceCard
      color={colors.unregularized}
      title={I18n.t('viesco-history-unregularized')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const RegularizedCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format('DD/MM/YY')} - </NestedTextBold>
      {event.start_date.format('H:mm')} - {event.end_date.format('H:mm')}
    </Text>
  );
  return (
    <PresenceCard
      color={colors.regularized}
      title={I18n.t('viesco-history-regularized')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const LatenessCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format('DD/MM/YY')} - </NestedTextBold>
      {event.end_date.format('H:mm')}
      <NestedTextBold> - {event.end_date.diff(event.start_date, 'minutes')}mn</NestedTextBold>
    </Text>
  );
  return (
    <PresenceCard color={colors.lateness} title={I18n.t('viesco-history-latenesses')} renderItem={renderItem} elements={elements} />
  );
};

export const DepartureCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format('DD/MM/YY')} - </NestedTextBold>
      {event.start_date.format('H:mm')}
      <NestedTextBold> - {Math.abs(event.start_date.diff(event.end_date, 'minutes'))}mn</NestedTextBold>
    </Text>
  );
  return (
    <PresenceCard
      color={colors.departure}
      title={I18n.t('viesco-history-departures')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const ForgotNotebookCard = ({ elements }) => {
  const renderItem = event => <TextBold> {event.date.format('DD/MM/YY')}</TextBold>;
  return (
    <PresenceCard
      color={colors.forgotNotebook}
      title={I18n.t('viesco-history-forgotten-notebooks')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const IncidentCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedText> {event.label}</NestedText> - <NestedTextBold>{event.date.format('DD/MM/YY H:mm')}</NestedTextBold> -{' '}
      {event.protagonist.label}
    </Text>
  );
  return (
    <PresenceCard color={colors.incident} title={I18n.t('viesco-history-incidents')} renderItem={renderItem} elements={elements} />
  );
};

export const PunishmentCard = ({ elements }) => {
  const getPunishmentDate = (punishment: IPunishment) => {
    let createdDate: string = punishment?.created_at.format('DD/MM/YY');
    switch (punishment.punishment_category_id) {
      case 1: //DUTY
        let dutyDate: string = createdDate;
        if (punishment.delay_at) {
          dutyDate = punishment.delay_at.format('DD/MM/YY');
        }
        return I18n.t('viesco-incidents-punishments-date.for-the') + dutyDate;
      case 2: //DETENTION
        let startDetentionDate: string = createdDate;
        if (punishment.start_date) {
          startDetentionDate = punishment.start_date.format('DD/MM/YY');
        }
        return I18n.t('viesco-incidents-punishments-date.for-the') + startDetentionDate;
      case 3: //BLAME
        return I18n.t('viesco-incidents-punishments-date.created-on') + createdDate;
      case 4: // EXCLUSION
        if (punishment.start_date && punishment.end_date) {
          let startExcludeDate: string = punishment.start_date.format('DD/MM/YY');
          let endExcludeDate: string = punishment.end_date.format('DD/MM/YY');
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
      default:
        return createdDate;
    }
  };

  const renderItem = (event: IPunishment) => (
    <Text>
      <NestedTextBold> {event.label} - </NestedTextBold>
      {getPunishmentDate(event)}
    </Text>
  );

  return (
    <PresenceCard
      color={colors.punishment}
      title={I18n.t('viesco-history-punishments')}
      renderItem={renderItem}
      elements={elements}
    />
  );
};
