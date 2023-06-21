import * as React from 'react';
import { ColorValue, FlatList, SectionList, StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import {
  BodyBoldText,
  BodyText,
  NestedBoldText,
  NestedText,
  SmallBoldText,
  SmallText,
  TextSizeStyle,
} from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { IUserChild } from '~/framework/modules/viescolaire/competences/model';
import { IChildEvents, IChildrenEvents, IEvent } from '~/framework/modules/viescolaire/presences/model';

const styles = StyleSheet.create({
  childContainer: {
    marginTop: UI_SIZES.spacing.small,
  },
  eventNestedText: {
    ...TextSizeStyle.Small,
  },
  sectionTitleText: {
    color: theme.ui.text.light,
  },
});

const getSectionTitle = (key: string): string => {
  switch (key) {
    case 'DEPARTURE':
      return I18n.get('presences-history-category-departures');
    case 'LATENESS':
      return I18n.get('presences-history-category-latenesses');
    case 'NO_REASON':
      return I18n.get('presences-history-category-noreason');
    case 'REGULARIZED':
      return I18n.get('presences-history-category-regularized');
    case 'UNREGULARIZED':
      return I18n.get('presences-history-category-unregularized');
    default:
      return '';
  }
};

const renderEvent = (key: string, event: IEvent) => {
  let color: ColorValue | undefined;
  let duration: number | undefined;

  switch (key) {
    case 'DEPARTURE':
      color = viescoTheme.palette.presencesEvents.departure;
      duration = Math.abs(event.startDate.diff(event.endDate, 'minutes'));
      break;
    case 'LATENESS':
      color = viescoTheme.palette.presencesEvents.lateness;
      duration = event.endDate.diff(event.startDate, 'minutes');
      break;
    case 'NO_REASON':
      color = viescoTheme.palette.presencesEvents.noReason;
      break;
    case 'REGULARIZED':
      color = viescoTheme.palette.presencesEvents.regularized;
      break;
    case 'UNREGULARIZED':
      color = viescoTheme.palette.presencesEvents.unregularized;
      break;
    default:
  }

  return (
    <SmallText>
      <NestedText style={[styles.eventNestedText, { color }]}>{'\u25A0 '}</NestedText>
      <SmallBoldText style={{ color }}>{event.startDate.format('DD/MM/YY')}</SmallBoldText>
      <SmallText style={{ color }}>{` - ${event.startDate.format('HH:mm')}  - ${event.endDate.format('HH:mm')}`}</SmallText>
      {duration ? <NestedBoldText style={{ color }}>{` - ${duration}mn`}</NestedBoldText> : null}
    </SmallText>
  );
};

interface IChildEventsProps {
  events: IChildEvents;
  childName?: string;
}

interface IChildrenEventsModalProps {
  childrenEvents: IChildrenEvents;
  userChildren: IUserChild[];
}

const ChildEvents = (props: IChildEventsProps) => {
  const sections = Object.entries(props.events)
    .filter(([id, value]) => value.length > 0)
    .map(([category, events]) => {
      return { title: category, data: events };
    });

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id?.toString()}
      renderItem={({ item, section }) => renderEvent(section.title, item)}
      renderSectionHeader={({ section: { title } }) => (
        <SmallText style={styles.sectionTitleText}>{getSectionTitle(title).toUpperCase()}</SmallText>
      )}
      ListHeaderComponent={<BodyBoldText>{props.childName}</BodyBoldText>}
      style={styles.childContainer}
    />
  );
};

const ChildrenEventsModal = React.forwardRef<ModalBoxHandle, IChildrenEventsModalProps>((props, ref) => {
  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText>{I18n.get('presences-childreneventsmodal-title')}</BodyText>
          <FlatList
            data={Object.entries(props.childrenEvents)}
            keyExtractor={([childId]) => childId}
            renderItem={({ item: [childId, events] }) => (
              <ChildEvents childName={props.userChildren.find(child => child.id === childId)?.firstName} events={events} />
            )}
            scrollEnabled={false}
          />
        </View>
      }
    />
  );
});

export default ChildrenEventsModal;
