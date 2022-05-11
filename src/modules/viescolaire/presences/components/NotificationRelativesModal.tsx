import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { NestedText, NestedTextBold, Text, TextBold } from '~/framework/components/text';
import ButtonOk from '~/ui/ConfirmDialog/buttonOk';
import { Loading } from '~/ui/Loading';
import { ModalBox } from '~/ui/Modal';

import { IChildArray } from '../../viesco/state/children';
import { colors } from './PresenceCard';

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  modalTitle: {
    marginBottom: 10,
    fontSize: 20,
  },
  modalSubsection: {
    paddingLeft: 15,
    marginBottom: 15,
  },
  eventTitle: {
    textTransform: 'uppercase',
    color: 'grey',
  },
  eventTextContainer: {
    marginVertical: 2,
  },
  eventNestedText: {
    fontSize: 10,
  },
  modalContainerView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentView: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 25,
    alignItems: 'stretch',
  },
});

const renderChild = (key: string, event) => {
  let title = '' as string;
  let color = '' as string;
  let duration = 0 as number;
  switch (key) {
    case 'DEPARTURE':
      title = I18n.t('viesco-history-departures');
      color = colors.departure;
      duration = Math.abs(moment(event.start_date).diff(moment(event.end_date), 'minutes'));
      break;
    case 'LATENESS':
      title = I18n.t('viesco-history-latenesses');
      color = colors.lateness;
      duration = moment(event.end_date).diff(moment(event.start_date), 'minutes');
      break;
    case 'NO_REASON':
      title = I18n.t('viesco-history-noreason');
      color = colors.no_reason;
      break;
    case 'UNREGULARIZED':
      title = I18n.t('viesco-history-unregularized');
      color = colors.unregularized;
      break;
    case 'REGULARIZED':
      title = I18n.t('viesco-history-regularized');
      color = colors.regularized;
      break;
    default:
  }
  return (
    <>
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventTextContainer}>
        <NestedText style={[styles.eventNestedText, { color }]}>{'\u25A0 '}</NestedText>
        <TextBold style={{ color }}>{moment(event.start_date).format('DD/MM/YY')}</TextBold> -{' '}
        <Text style={{ color }}>{moment(event.start_date).format('hh:mm')}</Text>
        <Text style={{ color }}> - {moment(event.end_date).format('hh:mm')}</Text>
        {duration > 0 ? <NestedTextBold style={{ color }}> - {duration}mn</NestedTextBold> : null}
      </Text>
    </>
  );
};

const renderEvents = (events: any) => {
  const formatedEvents = [] as any;
  for (const [key, value] of Object.entries(events)) {
    if (value && value !== undefined && value.length > 0) {
      formatedEvents.push(events[key] ? value.map(event => renderChild(key, event)) : null);
    }
  }
  return formatedEvents;
};

const checkIsEmptyEvents = (events: any) => {
  if (
    events.DEPARTURE.length <= 0 &&
    events.LATENESS.length <= 0 &&
    events.NO_REASON.length <= 0 &&
    events.UNREGULARIZED.length <= 0 &&
    events.REGULARIZED.length <= 0
  ) {
    return true;
  }
  return false;
};

export const NotificationRelativesModal = ({
  childrenArray,
  childrenEvents,
  visible,
  onClose,
}: {
  childrenArray: IChildArray;
  childrenEvents: any;
  visible: boolean;
  onClose: () => void;
}) => {
  return childrenEvents?.isFetching && childrenEvents?.isPristine ? (
    <Loading />
  ) : (
    <ModalBox backdropOpacity={0.5} isVisible={visible}>
      <View style={styles.modalContainerView}>
        <View style={styles.modalContentView}>
          <Text style={styles.modalTitle}>{I18n.t('viesco-notifications')}</Text>
          {childrenArray?.map(child =>
            childrenEvents.data &&
            childrenEvents?.data?.studentsEvents &&
            child.id &&
            childrenEvents?.data?.studentsEvents[child.id] &&
            !checkIsEmptyEvents(childrenEvents?.data?.studentsEvents[child.id].all) ? (
              <View>
                <Text style={styles.bold}>
                  {child.firstName} {child.lastName}
                </Text>
                <View style={styles.modalSubsection}>
                  <>{renderEvents(childrenEvents?.data?.studentsEvents[child.id]?.all)}</>
                </View>
              </View>
            ) : null,
          )}
          <ButtonOk label={I18n.t('common-ok')} onPress={onClose} />
        </View>
      </View>
    </ModalBox>
  );
};
