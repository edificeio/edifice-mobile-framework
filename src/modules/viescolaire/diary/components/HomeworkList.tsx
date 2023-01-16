import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, Switch, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import ChildPicker from '~/modules/viescolaire/dashboard/containers/ChildPicker';
import { IPersonnelList } from '~/modules/viescolaire/dashboard/state/personnel';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import diaryConfig from '~/modules/viescolaire/diary/moduleConfig';
import { IHomework, IHomeworkMap, ISession } from '~/modules/viescolaire/diary/reducer';
import {
  getTeacherName,
  hasEmptyDescription,
  homeworkListDetailsAdapter,
  isHomeworkDone,
  sessionListDetailsAdapter,
} from '~/modules/viescolaire/utils/diary';
import { PageContainer } from '~/ui/ContainerContent';
import DateTimePicker from '~/ui/DateTimePicker';

import { HomeworkItem, SessionItem } from './Items';

const styles = StyleSheet.create({
  mainView: {
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  homeworkPart: {
    flex: 1,
    paddingBottom: UI_SIZES.spacing.minor,
  },
  grid: {
    marginTop: UI_SIZES.spacing.small,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridHomeworkTitle: {
    flex: 1,
    alignItems: 'flex-end',
  },
  gridSwith: {
    marginTop: UI_SIZES.spacing.big,
    marginHorizontal: UI_SIZES.spacing.small,
  },
  gridSesionTitle: {
    flex: 1,
    alignItems: 'flex-start',
  },
  datePicker: {
    marginHorizontal: UI_SIZES.spacing.minor,
  },
});

enum SwitchState {
  HOMEWORK,
  SESSION,
}

type HomeworkListProps = {
  updateHomeworkProgress?: any;
  homeworks: IHomeworkMap;
  sessions: ISession[];
  personnel: IPersonnelList;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  onRefreshHomeworks: any;
  onRefreshSessions: any;
  childId: string;
} & NavigationInjectedProps;

const EmptyComponent = ({ title }) => <EmptyScreen svgImage="empty-homework" title={title} />;

const HomeworkList = ({ isFetching, onRefreshHomeworks, homeworkList, onHomeworkTap, onHomeworkStatusUpdate }) => {
  React.useEffect(() => {
    if (Object.keys(homeworkList).length === 0) onRefreshHomeworks();
  }, []);

  const homeworkDataList = homeworkList as IHomeworkMap;
  const homeworksArray = Object.values(homeworkDataList) as IHomework[];
  homeworksArray.sort((a, b) => moment(a.due_date).diff(moment(b.due_date)) || moment(a.created_date).diff(moment(b.created_date)));

  return (
    <FlatList
      style={styles.mainView}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshHomeworks} />}
      data={homeworksArray}
      renderItem={({ item, index }) => (
        <View key={item.id}>
          {index === 0 ||
          moment(item.due_date).format('DD/MM/YY') !== moment(homeworksArray[index - 1].due_date).format('DD/MM/YY') ? (
            <SmallBoldText>
              {I18n.t('viesco-homework-fordate')} {moment(item.due_date).format('dddd Do MMMM')}
            </SmallBoldText>
          ) : null}
          <HomeworkItem
            onPress={() => onHomeworkTap(item)}
            disabled={getUserSession().user.type !== 'Student'}
            checked={isHomeworkDone(item)}
            title={item.subject_id !== 'exceptional' ? item.subject.name : item.exceptional_label}
            subtitle={item.type}
            onChange={() => onHomeworkStatusUpdate(item)}
          />
        </View>
      )}
      ListEmptyComponent={<EmptyComponent title={I18n.t('viesco-homework-EmptyScreenText')} />}
    />
  );
};

const SessionList = ({ isFetching, onRefreshSessions, sessionList, onSessionTap, personnelList }) => {
  React.useEffect(() => {
    if (sessionList.length === 0) onRefreshSessions();
  }, []);

  return (
    <FlatList
      style={styles.mainView}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshSessions} />}
      data={sessionList}
      renderItem={({ item, index }) => (
        <View>
          {index === 0 || moment(item.date).format('DD/MM/YY') !== moment(sessionList[index - 1].date).format('DD/MM/YY') ? (
            <SmallBoldText>{moment(item.date).format('DD/MM/YY')}</SmallBoldText>
          ) : null}
          <SessionItem
            onPress={() => onSessionTap(item)}
            matiere={item.subject_id !== 'exceptional' ? item.subject.name : item.exceptional_label}
            author={getTeacherName(item.teacher_id, personnelList)}
          />
        </View>
      )}
      ListEmptyComponent={<EmptyComponent title={I18n.t('viesco-session-EmptyScreenText')} />}
    />
  );
};

export default (props: HomeworkListProps) => {
  const [switchValue, toggleSwitch] = React.useState<SwitchState>(SwitchState.HOMEWORK);
  const [startDate, setStartDate] = React.useState<moment.Moment>(moment());
  const [endDate, setEndDate] = React.useState<moment.Moment>(moment().add(3, 'week'));

  const notFirstRender = React.useRef(false);

  const onRefreshHomeworks = () => {
    props.onRefreshHomeworks(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  };

  const onRefreshSessions = () => {
    props.onRefreshSessions(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  };

  React.useEffect(() => {
    if (notFirstRender) {
      // avoid fetch when useState initialize
      onRefreshHomeworks();
      onRefreshSessions();
    }
  }, [startDate, endDate, props.childId]);

  React.useEffect(() => {
    notFirstRender.current = true;
  }, []);

  const DatePickers = React.memo(({ startDate, endDate }) => (
    <View style={styles.grid}>
      <SmallText>{I18n.t('viesco-from')}</SmallText>
      <DateTimePicker
        mode="date"
        style={styles.datePicker}
        value={startDate}
        maximumDate={endDate}
        onChange={setStartDate}
        color={viescoTheme.palette.diary}
      />
      <SmallText>{I18n.t('viesco-to')}</SmallText>
      <DateTimePicker
        mode="date"
        style={styles.datePicker}
        value={endDate}
        minimumDate={startDate}
        onChange={setEndDate}
        color={viescoTheme.palette.diary}
      />
    </View>
  ));

  const PlatformSpecificSwitch = React.memo(({ value }) => {
    let newProps = {};
    switch (Platform.OS) {
      case 'android': {
        newProps = { thumbColor: value ? viescoTheme.palette.diary : theme.palette.status.warning.regular, ...newProps };
        break;
      }
      case 'ios': {
        newProps = {
          trackColor: { false: theme.palette.status.warning.regular, true: viescoTheme.palette.diary },
          ios_backgroundColor: theme.palette.status.warning.regular,
          ...newProps,
        };
        break;
      }
      default: {
        newProps = { trackColor: { false: theme.palette.status.warning.regular, true: viescoTheme.palette.diary }, ...newProps };
        break;
      }
    }

    return (
      <View style={styles.grid}>
        <View style={styles.gridHomeworkTitle}>
          <SmallText>{I18n.t('viesco-homework')}</SmallText>
        </View>
        <Switch
          style={styles.gridSwith}
          onValueChange={() => {
            toggleSwitch(switchValue === SwitchState.SESSION ? SwitchState.HOMEWORK : SwitchState.SESSION);
          }}
          value={switchValue === SwitchState.SESSION}
          {...newProps}
        />
        <View style={styles.gridSesionTitle}>
          <SmallText>{I18n.t('viesco-session')}</SmallText>
        </View>
      </View>
    );
  });

  const { isFetchingSession, isFetchingHomework } = props;

  return (
    <PageContainer>
      {getUserSession().user.type === 'Relative' && <ChildPicker />}
      <View style={styles.homeworkPart}>
        <DatePickers startDate={startDate} endDate={endDate} />
        <PlatformSpecificSwitch value={switchValue} />
        {switchValue === SwitchState.HOMEWORK ? (
          <HomeworkList
            isFetching={isFetchingHomework}
            onRefreshHomeworks={onRefreshHomeworks}
            homeworkList={props.homeworks}
            onHomeworkStatusUpdate={homework => props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework))}
            onHomeworkTap={homework =>
              props.navigation.navigate(`${diaryConfig.routeName}/homework`, homeworkListDetailsAdapter(homework, props.homeworks))
            }
          />
        ) : (
          <SessionList
            isFetching={isFetchingSession}
            onRefreshSessions={onRefreshSessions}
            sessionList={props.sessions.filter(session => !hasEmptyDescription(session))}
            onSessionTap={session =>
              props.navigation.navigate(
                `${diaryConfig.routeName}/session`,
                sessionListDetailsAdapter(session, props.personnel, props.sessions),
              )
            }
            personnelList={props.personnel}
          />
        )}
      </View>
    </PageContainer>
  );
};
