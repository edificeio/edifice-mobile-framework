import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyText, NestedBoldText, NestedText, SmallBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { IChildArray } from '~/modules/viescolaire/dashboard/state/children';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { ModalBox } from '~/ui/Modal';

const styles = StyleSheet.create({
  modalTitle: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  modalSubsection: {
    paddingLeft: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.small,
  },
  eventTitle: {
    textTransform: 'uppercase',
    color: theme.palette.grey.grey,
  },
  eventTextContainer: {
    marginVertical: UI_SIZES.spacing.tiny,
  },
  eventNestedText: {
    ...TextSizeStyle.Small,
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

const renderChild = (key: string, previousKey: string, event) => {
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
      color = viescoTheme.palette.presencesEvents.noReason;
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
      {previousKey !== key ? <SmallText style={styles.eventTitle}>{title}</SmallText> : null}
      <SmallText style={styles.eventTextContainer}>
        <NestedText style={[styles.eventNestedText, { color }]}>{'\u25A0 '}</NestedText>
        <SmallBoldText style={{ color }}>{moment(event.start_date).format('DD/MM/YY')}</SmallBoldText>
        <SmallText>{' - '}</SmallText>
        <SmallText style={{ color }}>{moment(event.start_date).format('HH:mm')}</SmallText>
        <SmallText style={{ color }}> - {moment(event.end_date).format('HH:mm')}</SmallText>
        {duration > 0 ? <NestedBoldText style={{ color }}>{' - ' + duration + 'mn'}</NestedBoldText> : null}
      </SmallText>
    </>
  );
};

const renderEvents = (events: any) => {
  const sortedEvents = Object.entries(events) as any;
  let previousKey = '' as string;
  const formatedEvents = [] as any;
  sortedEvents.sort((a, b) => String(a?.key?.toLocaleLowerCase() ?? '').localeCompare(String(b?.key?.toLocaleLowerCase() ?? '')));
  for (const [key, value] of sortedEvents) {
    if (value && value !== undefined && value.length > 0) {
      if (events[key]) {
        for (const event of value) {
          formatedEvents.push(renderChild(key, previousKey, event));
          previousKey = key;
        }
      }
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
          <BodyText style={styles.modalTitle}>{I18n.t('viesco-notifications')}</BodyText>
          {childrenArray?.map(child =>
            childrenEvents.data &&
            childrenEvents?.data?.studentsEvents &&
            child.id &&
            childrenEvents?.data?.studentsEvents[child.id] &&
            !checkIsEmptyEvents(childrenEvents?.data?.studentsEvents[child.id].all) ? (
              <View>
                <SmallBoldText>{child.firstName + ' ' + child.lastName}</SmallBoldText>
                <View style={styles.modalSubsection}>
                  <>{renderEvents(childrenEvents?.data?.studentsEvents[child.id]?.all)}</>
                </View>
              </View>
            ) : null,
          )}
          <ActionButton text={I18n.t('common-ok')} action={onClose} />
        </View>
      </View>
    </ModalBox>
  );
};
