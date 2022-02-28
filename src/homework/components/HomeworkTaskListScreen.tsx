import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, SectionList, TouchableOpacity, View } from 'react-native';
import ViewOverflow from 'react-native-view-overflow';
import { NavigationInjectedProps } from 'react-navigation';

import HomeworkCard from './HomeworkCard';
import HomeworkDayCheckpoint from './HomeworkDayCheckpoint';
import HomeworkTimeline from './HomeworkTimeline';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { IHomeworkDiary, IHomeworkDiaryList } from '~/homework/reducers/diaryList';
import { IHomeworkTask } from '~/homework/reducers/tasks';
import { getHomeworkWorkflowInformation } from '~/homework/rights';
import { Loading } from '~/ui';
import { EmptyScreen } from '~/ui/EmptyScreen';
import today from '~/utils/today';
import { openUrl } from '~/framework/util/linking';
import Label from '~/framework/components/label';
import { UI_SIZES } from '~/framework/components/constants';
import theme from '~/app/theme';
import config from '../config';
import { PageView } from '~/framework/components/page';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderBackAction } from '~/framework/components/header';

// Props definition -------------------------------------------------------------------------------

export interface IHomeworkTaskListScreenDataProps {
  isFetching?: boolean;
  diaryId?: string;
  didInvalidate?: boolean;
  error?: boolean;
  errmsg?: any;
  diaryListData?: IHomeworkDiaryList;
  diaryInformation?: IHomeworkDiary;
  tasksByDay?: {
    id: string;
    date: moment.Moment;
    tasks: IHomeworkTask[];
  }[];
  session: IUserSession;
}

export interface IHomeworkTaskListScreenEventProps {
  onFocus?: () => void;
  onRefresh?: (diaryId: string) => void;
  onScrollBeginDrag?: () => void;
}

interface IHomeworkTaskListScreenState {
  fetching: boolean;
  pastDateLimit: moment.Moment;
}

export type IHomeworkTaskListScreenProps = IHomeworkTaskListScreenDataProps &
  IHomeworkTaskListScreenEventProps &
  NavigationInjectedProps<{}> &
  IHomeworkTaskListScreenState;

// Main component ---------------------------------------------------------------------------------

export class HomeworkTaskListScreen extends React.PureComponent<IHomeworkTaskListScreenProps, object> {
  state = {
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

  render() {
    const { isFetching, didInvalidate, diaryInformation, navigation, error } = this.props;
    const diaryTitle = diaryInformation?.title;
    const pageContent = isFetching && didInvalidate ? <Loading /> : error ? this.renderError() : this.renderList();

    const navBarInfo = {
      left: <HeaderBackAction navigation={navigation} />,
      title: diaryTitle || I18n.t('Homework'),
    };

    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: diaryTitle || I18n.t('Homework'),
        }}>
        {pageContent}
      </PageView>
    );
  }

  private renderError() {
    return <EmptyContentScreen />;
  }

  private renderList() {
    const { diaryListData, diaryId, tasksByDay, navigation, onRefresh, session } = this.props;
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
        {noFutureHomeworkHiddenPast ? null : <HomeworkTimeline leftPosition={UI_SIZES.spacing.extraLarge} />}
        <SectionList
          scrollEnabled={!hasNoDiaries}
          contentContainerStyle={{
            padding: UI_SIZES.spacing.large,
            flex: noFutureHomeworkHiddenPast ? 1 : undefined,
          }}
          sections={displayedHomework}
          CellRendererComponent={ViewOverflow}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                marginBottom: UI_SIZES.spacing.extraSmall,
                marginTop: UI_SIZES.spacing.extraLarge,
              }}>
              <HomeworkDayCheckpoint date={title} />
            </View>
          )}
          renderItem={({ item, index }) => (
            <HomeworkCard
              key={index}
              title={item.title}
              content={item.content}
              date={item.date}
              onPress={() => navigation!.navigate(`${config.name}/details`, { task: item })}
            />
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={fetching}
              onRefresh={() => {
                this.setState({ fetching: true });
                onRefresh && diaryId && onRefresh(diaryId);
              }}
            />
          }
          ListHeaderComponent={() => {
            const labelColor = noRemainingPastHomework ? theme.greyPalette.grey : theme.greyPalette.black;
            const labelText = I18n.t(
              `homework.homeworkTaskListScreen.${noRemainingPastHomework ? 'noMorePastHomework' : 'displayPastDays'}`,
            );
            return hasPastHomeWork ? (
              <TouchableOpacity
                style={{ alignSelf: 'center' }}
                disabled={noRemainingPastHomework}
                onPress={() => {
                  const newestRemainingPastHW = remainingPastHomework[remainingPastHomework.length - 1];
                  const newestRemainingPastHWDate = newestRemainingPastHW.title;
                  const newestRemainingPastHWWeekStart = moment(newestRemainingPastHWDate).startOf('isoWeek');
                  this.setState({ pastDateLimit: newestRemainingPastHWWeekStart });
                }}>
                <Label
                  labelStyle="outline"
                  labelSize="large"
                  icon={noRemainingPastHomework ? undefined : 'back'}
                  iconStyle={{ transform: [{ rotate: '90deg' }] }}
                  color={labelColor}
                  text={labelText}
                />
              </TouchableOpacity>
            ) : null;
          }}
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
}

export default HomeworkTaskListScreen;
