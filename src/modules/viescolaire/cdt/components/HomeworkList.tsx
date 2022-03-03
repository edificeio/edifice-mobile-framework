import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View, StyleSheet, Switch, ScrollView, RefreshControl, Platform } from 'react-native';

import { HomeworkItem, SessionItem } from './Items';

import { getSessionInfo } from '~/App';
import { Text, TextBold } from '~/framework/components/text';
import { IHomework, IHomeworkList } from '~/modules/viescolaire/cdt/state/homeworks';
import { ISession } from '~/modules/viescolaire/cdt/state/sessions';
import {
  isHomeworkDone,
  homeworkListDetailsAdapter,
  sessionListDetailsAdapter,
  getTeacherName,
} from '~/modules/viescolaire/utils/cdt';
import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
import { IPersonnelList } from '~/modules/viescolaire/viesco/state/personnel';
import { INavigationProps } from '~/types';
import { PageContainer } from '~/ui/ContainerContent';
import DateTimePicker from '~/ui/DateTimePicker';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import EmptyHomework from 'ode-images/empty-screen/empty-homework.svg';

const style = StyleSheet.create({
  homeworkPart: { flex: 1, paddingBottom: 8, paddingHorizontal: 15 },
  title: { fontSize: 18 },
  subtitle: { color: '#AFAFAF' },
  course: { fontWeight: 'bold', textTransform: 'uppercase' },
  grid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
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

export default (props: HomeworkListProps) => {
  const [switchValue, toggleSwitch] = React.useState<SwitchState>(SwitchState.HOMEWORK);
  const [startDate, setStartDate] = React.useState<moment.Moment>(moment());
  const [endDate, setEndDate] = React.useState<moment.Moment>(moment().add(3, 'week'));

  const notFirstRender = React.useRef(false);

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

  const onRefreshHomeworks = () => {
    props.onRefreshHomeworks(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  };

  const onRefreshSessions = () => {
    props.onRefreshSessions(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  };

  const DatePickers = React.memo(({ startDate, endDate }) => (
    <View style={style.grid}>
      <Text>{I18n.t('viesco-from')}</Text>
      <DateTimePicker
        mode="date"
        style={{ marginHorizontal: 12 }}
        value={startDate}
        maximumDate={endDate}
        onChange={setStartDate}
      />
      <Text>{I18n.t('viesco-to')}</Text>
      <DateTimePicker mode="date" style={{ marginHorizontal: 12 }} value={endDate} minimumDate={startDate} onChange={setEndDate} />
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
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text>{I18n.t('viesco-homework')}</Text>
        </View>
        <Switch
          style={{ marginTop: 30, marginHorizontal: 12 }}
          onValueChange={() => {
            toggleSwitch(switchValue === SwitchState.SESSION ? SwitchState.HOMEWORK : SwitchState.SESSION);
          }}
          value={switchValue === SwitchState.SESSION}
          {...newProps}
        />
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text>{I18n.t('viesco-session')}</Text>
        </View>
      </View>
    );
  });

  const { isFetchingSession, isFetchingHomework } = props;

  return (
    <PageContainer>
      {getSessionInfo().type === 'Relative' && <ChildPicker />}
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

const EmptyComponent = ({ title }) => <EmptyScreen svgImage={<EmptyHomework />} title={title} />;

const HomeworkList = ({ isFetching, onRefreshHomeworks, homeworkList, onHomeworkTap, onHomeworkStatusUpdate }) => {
  React.useEffect(() => {
    if (Object.keys(homeworkList).length === 0) onRefreshHomeworks();
  }, []);

  const homeworkDataList = homeworkList as IHomeworkList;
  const homeworksArray = Object.values(homeworkDataList) as IHomework[];
  homeworksArray.sort((a, b) => moment(a.due_date).diff(moment(b.due_date)) || moment(a.created_date).diff(moment(b.created_date)));
  return (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshHomeworks} />}>
      {homeworksArray.length === 0 ? (
        <EmptyComponent title={I18n.t('viesco-homework-EmptyScreenText')} />
      ) : (
        homeworksArray.map((homework, index, list) => (
          <View key={homework.id}>
            {index === 0 || moment(homework.due_date).format('DD/MM/YY') !== moment(list[index - 1].due_date).format('DD/MM/YY') ? (
              <TextBold>
                {I18n.t('viesco-homework-fordate')} {moment(homework.due_date).format('dddd Do MMMM')}
              </TextBold>
            ) : null}
            <HomeworkItem
              onPress={() => onHomeworkTap(homework)}
              disabled={getSessionInfo().type !== 'Student'}
              checked={isHomeworkDone(homework)}
              title={homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label}
              subtitle={homework.type}
              onChange={() => onHomeworkStatusUpdate(homework)}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
};

const SessionList = ({ isFetching, onRefreshSessions, sessionList, onSessionTap, personnelList }) => {
  React.useEffect(() => {
    if (sessionList.length === 0) onRefreshSessions();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefreshSessions} />}>
      {sessionList.length === 0 ? (
        <EmptyComponent title={I18n.t('viesco-session-EmptyScreenText')} />
      ) : (
        sessionList.map(
          (session, index, list) =>
            !hasEmptyDescription(session) && (
              <View>
                {index === 0 || moment(session.date).format('DD/MM/YY') !== moment(list[index - 1].date).format('DD/MM/YY') ? (
                  <TextBold>{moment(session.date).format('DD/MM/YY')}</TextBold>
                ) : null}
                <SessionItem
                  onPress={() => onSessionTap(session)}
                  matiere={session.subject_id !== 'exceptional' ? session.subject.name : session.exceptional_label}
                  author={getTeacherName(session.teacher_id, personnelList)}
                />
              </View>
            ),
        )
      )}
    </ScrollView>
  );
};

const hasEmptyDescription = (session: ISession) => {
  // retrieve html description tag and search "body" tag
  const regexp = /<(\w+)>[^<]+<\/\1>|[^<>]+/g;
  const htmlTags = session.description.match(regexp) as string[];
  if (!htmlTags) return true;
  const index = htmlTags.findIndex(item => item === 'body') as number;

  if (session.description === '' || index === -1 || htmlTags[index + 1] === '/body') return true;
  return false;
};
