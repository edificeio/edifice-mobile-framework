/**
 * HomeworkPage
 *
 * Display page for all homework in a calendar-like way.
 *
 * Props :
 *    `isFetching` - is data currently fetching from the server.
 *    `diaryId` - displayed diaryId.
 *    `tasksByDay` - list of data.
 *
 *    `onMount` - fired when component did mount.
 *    `onRefresh` - fired when the user ask to refresh the list.
 *    `onSelect` - fired when the user touches a displayed task.
 *
 *    `navigation` - React Navigation instance.
 */

// Imports ----------------------------------------------------------------------------------------

// Libraries
import style from 'glamorous-native';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { Linking, RefreshControl, SectionList, Text } from 'react-native';
import ViewOverflow from 'react-native-view-overflow';

// Components

import { NavigationScreenProp } from 'react-navigation';

import HomeworkCard from './HomeworkCard';
import HomeworkDayCheckpoint from './HomeworkDayCheckpoint';
import HomeworkTimeline from './HomeworkTimeline';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { IHomeworkDiary, IHomeworkDiaryList } from '~/homework/reducers/diaryList';
import { IHomeworkTask } from '~/homework/reducers/tasks';
import { getHomeworkWorkflowInformation } from '~/homework/rights';
import { CommonStyles } from '~/styles/common/styles';
import { FlatButton, Loading } from '~/ui';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';
import { EmptyScreen } from '~/ui/EmptyScreen';
import today from '~/utils/today';
import { openUrl } from '~/framework/util/linking';

const { View } = style;

// Props definition -------------------------------------------------------------------------------

export interface IHomeworkPageDataProps {
  isFetching?: boolean;
  diaryId?: string;
  didInvalidate?: boolean;
  diaryListData?: IHomeworkDiaryList;
  diaryInformation?: IHomeworkDiary;
  tasksByDay?: {
    id: string;
    date: moment.Moment;
    tasks: IHomeworkTask[];
  }[];
  session: IUserSession;
}

export interface IHomeworkPageEventProps {
  onFocus?: () => void;
  onRefresh?: (diaryId: string) => void;
  onSelect?: (diaryId: string, date: moment.Moment, itemId: string) => void;
  onScrollBeginDrag?: () => void;
}

export interface IHomeworkPageOtherProps {
  navigation?: NavigationScreenProp<object>;
}

interface IHomeworkPageState {
  fetching: boolean;
  pastDateLimit: moment.Moment;
}

export type IHomeworkPageProps = IHomeworkPageDataProps & IHomeworkPageEventProps & IHomeworkPageOtherProps & IHomeworkPageState;

// Main component ---------------------------------------------------------------------------------

export class HomeworkPage extends React.PureComponent<IHomeworkPageProps, object> {
  constructor(props) {
    super(props);
  }
  public state = {
    fetching: false,
    pastDateLimit: today(),
  };

  getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (nextProps.isFetching !== prevState.fetching) {
      return { fetching: nextProps.isFetching };
    } else return null;
  }

  componentDidUpdate(prevProps: any) {
    const { isFetching, diaryId } = this.props;

    if (prevProps.isFetching !== isFetching) {
      this.setState({ fetching: isFetching });
    }
    if (prevProps.diaryId !== diaryId) {
      this.setState({ pastDateLimit: today() });
    }
  }

  // Render

  public render() {
    const { isFetching, didInvalidate } = this.props;
    const pageContent = isFetching && didInvalidate ? this.renderLoading() : this.renderList();

    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }

  private renderList() {
    const { diaryListData, diaryId, tasksByDay, navigation, onRefresh, onSelect, onScrollBeginDrag, session } = this.props;
    const { fetching, pastDateLimit } = this.state;
    const hasNoDiaries = !diaryListData || (diaryListData && Object.keys(diaryListData).length === 0);
    const data = tasksByDay
      ? tasksByDay.map(day => ({
          title: day.date,
          data: day.tasks.map(task => ({
            ...task,
            date: day.date,
          })),
        }))
      : [];
    const pastHomework = data.filter(item => item.title.isBefore(today(), 'day'));
    const remainingPastHomework = pastHomework.filter(item => item.title.isBefore(pastDateLimit, 'day'));
    const displayedPastHomework = pastHomework.filter(item => item.title.isBetween(pastDateLimit, today(), 'day', '[)'));
    const futureHomework = data.filter(item => item.title.isSameOrAfter(today(), 'day'));
    const displayedHomework = [...displayedPastHomework, ...futureHomework];
    const hasPastHomeWork = pastHomework.length > 0;
    const noRemainingPastHomework = remainingPastHomework.length === 0;
    const noFutureHomeworkHiddenPast = futureHomework.length === 0 && pastDateLimit.isSame(today(), 'day');
    const homeworkWorkflowInformation = getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;

    return (
      <View style={{ flex: 1 }}>
        {noFutureHomeworkHiddenPast ? null : (
          <>
            <HomeworkTimeline />
            <View
              style={{
                backgroundColor: CommonStyles.lightGrey,
                height: 15,
                marginLeft: 50,
                width: '100%',
                position: 'absolute',
                zIndex: 1,
                top: 0,
              }}
            />
          </>
        )}
        <SectionList
          scrollEnabled={!hasNoDiaries}
          contentContainerStyle={noFutureHomeworkHiddenPast ? { flex: 1 } : null}
          sections={displayedHomework}
          CellRendererComponent={ViewOverflow} /* TS-ISSUE : CellRendererComponent is an official FlatList prop */
          stickySectionHeadersEnabled
          renderSectionHeader={({ section: { title } }) => (
            <HomeworkDayCheckpoint
              nb={title.date()}
              text={title.format('dddd D MMMM YYYY')}
              active={title.isSame(today(), 'day')}
            />
          )}
          renderItem={({ item, index }) => (
            <HomeworkCard
              key={item.id}
              title={item.title}
              content={item.content}
              onPress={() => {
                onSelect!(diaryId!, item.date, item.id);
                navigation!.navigate('HomeworkTask', { title: item.title });
              }}
            />
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={fetching}
              onRefresh={() => {
                this.setState({ fetching: true });
                onRefresh(diaryId);
              }}
            />
          }
          onScrollBeginDrag={() => onScrollBeginDrag()}
          ListHeaderComponent={
            hasPastHomeWork ? (
              <View style={{ height: 45, justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
                {noRemainingPastHomework ? (
                  <Text style={{ fontStyle: 'italic', color: CommonStyles.grey }}>{I18n.t('homework-previousNoMore')}</Text>
                ) : (
                  <FlatButton
                    loading={false}
                    title={I18n.t('homework-previousSee')}
                    onPress={() => {
                      const newestRemainingPastHW = remainingPastHomework[remainingPastHomework.length - 1];
                      const newestRemainingPastHWDate = newestRemainingPastHW.title;
                      const newestRemainingPastHWWeekStart = moment(newestRemainingPastHWDate).startOf('isoWeek');
                      this.setState({ pastDateLimit: newestRemainingPastHWWeekStart });
                    }}
                  />
                )}
              </View>
            ) : null
          }
          ListFooterComponent={noFutureHomeworkHiddenPast ? null : <View style={{ height: 15 }} />}
          ListEmptyComponent={
            noFutureHomeworkHiddenPast ? (
              <EmptyScreen
                imageSrc={require('ASSETS/images/empty-screen/homework.png')}
                imgWidth={265.98}
                imgHeight={279.97}
                text={I18n.t(`homework-${hasNoDiaries ? 'diaries' : 'tasks'}-emptyScreenText`)}
                title={I18n.t(
                  `homework-${
                    hasNoDiaries ? (hasCreateHomeworkResourceRight ? 'diaries' : 'diaries-noCreationRight') : 'tasks'
                  }-emptyScreenTitle`,
                )}
                buttonText={hasNoDiaries && hasCreateHomeworkResourceRight ? I18n.t('homework-createDiary') : undefined}
                buttonAction={() => {
                  //TODO: create generic function inside oauth (use in myapps, etc.)
                  if (!DEPRECATED_getCurrentPlatform()) {
                    console.warn('Must have a platform selected to redirect the user');
                    return null;
                  }
                  const url = `${DEPRECATED_getCurrentPlatform()!.url}/homeworks`;
                  openUrl(url);
                  Trackers.trackEvent('Homework', 'GO TO', 'Create in Browser');
                }}
                customStyle={{ marginBottom: hasPastHomeWork ? 60 : 0 }}
              />
            ) : null
          }
        />
      </View>
    );
  }

  private renderLoading() {
    return <Loading />;
  }
}

export default HomeworkPage;
