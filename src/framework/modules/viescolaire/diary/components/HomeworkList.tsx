import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet, Switch, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/list/flat-list';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { IUser } from '~/framework/modules/auth/model';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import {
  getTeacherName,
  hasEmptyDescription,
  homeworkListDetailsAdapter,
  isHomeworkDone,
  sessionListDetailsAdapter,
} from '~/framework/modules/viescolaire/common/utils/diary';
import { IDiarySession, IHomework, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { PageContainer } from '~/ui/ContainerContent';

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
  sessions: IDiarySession[];
  personnel: IUser[];
  isFetchingHomework: boolean;
  isFetchingSession: boolean;
  onRefreshHomeworks: any;
  onRefreshSessions: any;
  childId: string;
  userType?: UserType;
} & NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.homeworkList>;

const EmptyComponent = ({ title }) => <EmptyScreen svgImage="empty-homework" title={title} />;

const HomeworkList = ({ isFetching, onRefreshHomeworks, homeworkList, onHomeworkTap, onHomeworkStatusUpdate, userType }) => {
  React.useEffect(() => {
    if (Object.keys(homeworkList).length === 0) onRefreshHomeworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {I18n.get('diary-homeworklist-duedate', { date: moment(item.due_date).format('dddd Do MMMM') })}
            </SmallBoldText>
          ) : null}
          <HomeworkItem
            onPress={() => onHomeworkTap(item)}
            disabled={userType !== UserType.Student}
            checked={isHomeworkDone(item)}
            title={item.subject_id !== 'exceptional' ? item.subject.name : item.exceptional_label}
            subtitle={item.type}
            onChange={() => onHomeworkStatusUpdate(item)}
          />
        </View>
      )}
      ListEmptyComponent={<EmptyComponent title={I18n.get('diary-homeworklist-emptyscreen-homework')} />}
    />
  );
};

const SessionList = ({ isFetching, onRefreshSessions, sessionList, onSessionTap, personnelList }) => {
  React.useEffect(() => {
    if (sessionList.length === 0) onRefreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ListEmptyComponent={<EmptyComponent title={I18n.get('diary-homeworklist-emptyscreen-session')} />}
    />
  );
};

export default (props: HomeworkListProps) => {
  const [switchValue, toggleSwitch] = React.useState<SwitchState>(SwitchState.HOMEWORK);
  const [startDate, setStartDate] = React.useState<Moment>(moment());
  const [endDate, setEndDate] = React.useState<Moment>(moment().add(3, 'week'));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, props.childId]);

  React.useEffect(() => {
    notFirstRender.current = true;
  }, []);

  const switchProps =
    Platform.OS === 'ios'
      ? {
          trackColor: { false: theme.palette.status.warning.regular, true: viescoTheme.palette.diary },
          ios_backgroundColor: theme.palette.status.warning.regular,
        }
      : { thumbColor: switchValue ? viescoTheme.palette.diary : theme.palette.status.warning.regular };
  const { isFetchingSession, isFetchingHomework, userType } = props;

  return (
    <PageContainer>
      {userType === UserType.Relative ? <ChildPicker /> : null}
      <View style={styles.homeworkPart}>
        <View style={styles.grid}>
          <SmallText>{I18n.get('diary-homeworklist-from')}</SmallText>
          <DateTimePicker
            mode="date"
            value={startDate}
            onChangeValue={setStartDate}
            maximumDate={endDate}
            iconColor={viescoTheme.palette.diary}
            style={styles.datePicker}
          />
          <SmallText>{I18n.get('diary-homeworklist-to')}</SmallText>
          <DateTimePicker
            mode="date"
            value={endDate}
            onChangeValue={setEndDate}
            minimumDate={startDate}
            iconColor={viescoTheme.palette.diary}
            style={styles.datePicker}
          />
        </View>
        <View style={styles.grid}>
          <View style={styles.gridHomeworkTitle}>
            <SmallText>{I18n.get('diary-homeworklist-homework')}</SmallText>
          </View>
          <Switch
            style={styles.gridSwith}
            onValueChange={() => {
              toggleSwitch(switchValue === SwitchState.SESSION ? SwitchState.HOMEWORK : SwitchState.SESSION);
            }}
            value={switchValue === SwitchState.SESSION}
            {...switchProps}
          />
          <View style={styles.gridSesionTitle}>
            <SmallText>{I18n.get('diary-homeworklist-session')}</SmallText>
          </View>
        </View>
        {switchValue === SwitchState.HOMEWORK ? (
          <HomeworkList
            isFetching={isFetchingHomework}
            onRefreshHomeworks={onRefreshHomeworks}
            homeworkList={props.homeworks}
            onHomeworkStatusUpdate={homework => props.updateHomeworkProgress(homework.id, !isHomeworkDone(homework))}
            onHomeworkTap={homework =>
              props.navigation.navigate(diaryRouteNames.homework, homeworkListDetailsAdapter(homework, props.homeworks))
            }
            userType={userType}
          />
        ) : (
          <SessionList
            isFetching={isFetchingSession}
            onRefreshSessions={onRefreshSessions}
            sessionList={props.sessions.filter(session => !hasEmptyDescription(session))}
            onSessionTap={session =>
              props.navigation.navigate(
                diaryRouteNames.session,
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
