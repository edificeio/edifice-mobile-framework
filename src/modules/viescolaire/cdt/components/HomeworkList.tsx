import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, Switch, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Text, TextBold } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import { IHomework, IHomeworkList } from '~/modules/viescolaire/cdt/state/homeworks';
import { ISession } from '~/modules/viescolaire/cdt/state/sessions';
import {
  getTeacherName,
  homeworkListDetailsAdapter,
  isHomeworkDone,
  sessionListDetailsAdapter,
} from '~/modules/viescolaire/utils/cdt';
import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
import { IPersonnelList } from '~/modules/viescolaire/viesco/state/personnel';
import { INavigationProps } from '~/types';
import { PageContainer } from '~/ui/ContainerContent';
import DateTimePicker from '~/ui/DateTimePicker';

import { HomeworkItem, SessionItem } from './Items';

const style = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  homeworkPart: {
    flex: 1,
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  grid: {
    marginTop: 10,
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
    marginTop: 30,
    marginHorizontal: 12,
  },
  gridSesionTitle: {
    flex: 1,
    alignItems: 'flex-start',
  },
  datePicker: {
    marginHorizontal: 12,
  },
});

enum SwitchState {
  HOMEWORK,
  SESSION,
}

type HomeworkListProps = {
  updateHomeworkProgress?: any;
  homeworks: IHomeworkList;
  sessions: ISession[];
  personnel: IPersonnelList;
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  onRefreshHomeworks: any;
  onRefreshSessions: any;
  childId: string;
} & INavigationProps;

const hasEmptyDescription = (session: ISession) => {
  // retrieve html description tag and search "body" tag
  const regexp = /<(\w+)>[^<]+<\/\1>|[^<>]+/g;
  const htmlTags = session.description.match(regexp) as string[];
  if (!htmlTags) return true;
  const index = htmlTags.findIndex(item => item === 'body') as number;

  if (session.description === '' || index === -1 || htmlTags[index + 1] === '/body') return true;
  return false;
};

const EmptyComponent = ({ title }) => <EmptyScreen svgImage="empty-homework" title={title} />;

const HomeworkList = ({ isFetching, onRefreshHomeworks, homeworkList, onHomeworkTap, onHomeworkStatusUpdate }) => {
  React.useEffect(() => {
    if (Object.keys(homeworkList).length === 0) onRefreshHomeworks();
  }, []);

  const homeworkDataList = homeworkList as IHomeworkList;
  const homeworksArray = Object.values(homeworkDataList) as IHomework[];
  homeworksArray.sort((a, b) => moment(a.due_date).diff(moment(b.due_date)) || moment(a.created_date).diff(moment(b.created_date)));

  return (
    <FlatList
      style={style.mainView}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshHomeworks} />}
      data={homeworksArray}
      renderItem={({ item, index }) => (
        <View key={item.id}>
          {index === 0 ||
          moment(item.due_date).format('DD/MM/YY') !== moment(homeworksArray[index - 1].due_date).format('DD/MM/YY') ? (
            <TextBold>
              {I18n.t('viesco-homework-fordate')} {moment(item.due_date).format('dddd Do MMMM')}
            </TextBold>
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
      style={style.mainView}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshSessions} />}
      data={sessionList}
      renderItem={({ item, index }) => {
        if (!hasEmptyDescription(item)) {
          return (
            <View>
              {index === 0 || moment(item.date).format('DD/MM/YY') !== moment(sessionList[index - 1].date).format('DD/MM/YY') ? (
                <TextBold>{moment(item.date).format('DD/MM/YY')}</TextBold>
              ) : null}
              <SessionItem
                onPress={() => onSessionTap(item)}
                matiere={item.subject_id !== 'exceptional' ? item.subject.name : item.exceptional_label}
                author={getTeacherName(item.teacher_id, personnelList)}
              />
            </View>
          );
        } else {
          return null;
        }
      }}
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
    <View style={style.grid}>
      <Text>{I18n.t('viesco-from')}</Text>
      <DateTimePicker mode="date" style={style.datePicker} value={startDate} maximumDate={endDate} onChange={setStartDate} />
      <Text>{I18n.t('viesco-to')}</Text>
      <DateTimePicker mode="date" style={style.datePicker} value={endDate} minimumDate={startDate} onChange={setEndDate} />
    </View>
  ));

  const PlatformSpecificSwitch = React.memo(({ value }) => {
    let newProps = {};
    switch (Platform.OS) {
      case 'android': {
        newProps = { thumbColor: value ? '#2BAB6F' : '#FA9700', ...newProps };
        break;
      }
      case 'ios': {
        newProps = {
          trackColor: { false: '#FA9700', true: '#2BAB6F' },
          ios_backgroundColor: '#FA9700',
          ...newProps,
        };
        break;
      }
      default: {
        newProps = { trackColor: { false: '#FA9700', true: '#2BAB6F' }, ...newProps };
        break;
      }
    }

    return (
      <View style={style.grid}>
        <View style={style.gridHomeworkTitle}>
          <Text>{I18n.t('viesco-homework')}</Text>
        </View>
        <Switch
          style={style.gridSwith}
          onValueChange={() => {
            toggleSwitch(switchValue === SwitchState.SESSION ? SwitchState.HOMEWORK : SwitchState.SESSION);
          }}
          value={switchValue === SwitchState.SESSION}
          {...newProps}
        />
        <View style={style.gridSesionTitle}>
          <Text>{I18n.t('viesco-session')}</Text>
        </View>
      </View>
    );
  });

  const { isFetchingSession, isFetchingHomework } = props;

  return (
    <PageContainer>
      {getUserSession().user.type === 'Relative' && <ChildPicker />}
      <View style={style.homeworkPart}>
        <DatePickers startDate={startDate} endDate={endDate} />
        <PlatformSpecificSwitch value={switchValue} />
        {switchValue === SwitchState.HOMEWORK ? (
          <HomeworkList
            isFetching={isFetchingHomework}
            onRefreshHomeworks={onRefreshHomeworks}
            homeworkList={props.homeworks}
            onHomeworkStatusUpdate={homework => props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework))}
            onHomeworkTap={homework =>
              props.navigation.navigate('HomeworkPage', homeworkListDetailsAdapter(homework, props.homeworks))
            }
          />
        ) : (
          <SessionList
            isFetching={isFetchingSession}
            onRefreshSessions={onRefreshSessions}
            sessionList={props.sessions}
            onSessionTap={session =>
              props.navigation.navigate('SessionPage', sessionListDetailsAdapter(session, props.personnel, props.sessions))
            }
            personnelList={props.personnel}
          />
        )}
      </View>
    </PageContainer>
  );
};
