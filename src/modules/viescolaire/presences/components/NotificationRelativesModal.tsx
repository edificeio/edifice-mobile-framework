import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { NestedText, NestedTextBold, Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { IChildArray } from '~/modules/viescolaire/viesco/state/children';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';
import { DialogButtonOk } from '~/ui/ConfirmDialog/buttonOk';
import { ModalBox } from '~/ui/Modal';

const styles = StyleSheet.create({
  modalTitle: {
    ...TextSizeStyle.SlightBig,
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
  },
  modalSubsection: {
    paddingLeft: 15, // MO-142 use UI_SIZES.spacing here
    marginBottom: 15, // MO-142 use UI_SIZES.spacing here
  },
  eventTitle: {
    textTransform: 'uppercase',
    color: theme.palette.grey.grey,
  },
  eventTextContainer: {
    marginVertical: 2, // MO-142 use UI_SIZES.spacing here
  },
  eventNestedText: {
    ...TextSizeStyle.Tiny,
  },
  modalContainerView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentView: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: 5,
    padding: UI_SIZES.spacing.big,
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
      color = viescoTheme.palette.presencesEvents.departure;
      duration = Math.abs(moment(event.start_date).diff(moment(event.end_date), 'minutes'));
      break;
    case 'LATENESS':
      title = I18n.t('viesco-history-latenesses');
      color = viescoTheme.palette.presencesEvents.lateness;
      duration = moment(event.end_date).diff(moment(event.start_date), 'minutes');
      break;
    case 'NO_REASON':
      title = I18n.t('viesco-history-noreason');
      color = viescoTheme.palette.presencesEvents.no_reason;
      break;
    case 'UNREGULARIZED':
      title = I18n.t('viesco-history-unregularized');
      color = viescoTheme.palette.presencesEvents.unregularized;
      break;
    case 'REGULARIZED':
      title = I18n.t('viesco-history-regularized');
      color = viescoTheme.palette.presencesEvents.regularized;
      break;
    default:
  }
  return (
    <>
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventTextContainer}>
        <NestedText style={[styles.eventNestedText, { color }]}>{'\u25A0 '}</NestedText>
        <TextBold style={{ color }}>{moment(event.start_date).format('DD/MM/YY')}</TextBold>
        <Text>{' - '}</Text>
        <Text style={{ color }}>{moment(event.start_date).format('HH:mm')}</Text>
        <Text style={{ color }}> - {moment(event.end_date).format('HH:mm')}</Text>
        {duration > 0 ? <NestedTextBold style={{ color }}>{' - ' + duration + 'mn'}</NestedTextBold> : null}
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
    <LoadingIndicator />
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
                <TextBold>{child.firstName + ' ' + child.lastName}</TextBold>
                <View style={styles.modalSubsection}>
                  <>{renderEvents(childrenEvents?.data?.studentsEvents[child.id]?.all)}</>
                </View>
              </View>
            ) : null,
          )}
          <DialogButtonOk label={I18n.t('common-ok')} onPress={onClose} />
        </View>
      </View>
    </ModalBox>
  );
};
