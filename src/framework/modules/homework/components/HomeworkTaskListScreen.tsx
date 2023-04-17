import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import ViewOverflow from 'react-native-view-overflow';
import { ThunkDispatch } from 'redux-thunk';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Icon } from '~/framework/components/icon';
import Label from '~/framework/components/label';
import { PageView } from '~/framework/components/page';
import SectionList from '~/framework/components/sectionList';
import { SmallText, TextSizeStyle } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import config from '~/framework/modules/homework/module-config';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { IHomeworkDiary, IHomeworkDiaryList } from '~/framework/modules/homework/reducers/diaryList';
import { IHomeworkTask } from '~/framework/modules/homework/reducers/tasks';
import { getHomeworkWorkflowInformation } from '~/framework/modules/homework/rights';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { getDayOfTheWeek, today } from '~/framework/util/date';
import { Trackers } from '~/framework/util/tracker';
import { Loading } from '~/ui/Loading';

import HomeworkCard from './HomeworkCard';
import HomeworkDayCheckpoint from './HomeworkDayCheckpoint';
import HomeworkTimeline from './HomeworkTimeline';

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
  lastUpdated: any;
  session?: ISession;
}

export interface IHomeworkTaskListScreenEventProps {
  onFocus?: () => void;
  onRefresh?: (diaryId: string) => void;
  onScrollBeginDrag?: () => void;
  dispatch: ThunkDispatch<any, any, any>;
}

interface IHomeworkTaskListScreenState {
  fetching?: boolean;
  refreshing?: boolean;
  pastDateLimit: moment.Moment;
}

export interface HomeworkTaskListScreenNavigationParams {}

export type IHomeworkTaskListScreenProps = IHomeworkTaskListScreenDataProps &
  IHomeworkTaskListScreenEventProps &
  NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkTaskList>;

type DataType = {
  type: 'day';
  title: moment.Moment;
  data: { type: 'day'; id: string; title: string; content: string; date: moment.Moment }[];
};
type DataTypeOrFooter = DataType | { type: 'footer'; data: [{ type: 'footer' }]; title?: never };

const styles = StyleSheet.create({
  buttonPastHomework: {
    alignSelf: 'center',
  },
  dayCheckpoint: {
    zIndex: 1,
  },
  taskList: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    borderWidth: UI_SIZES.dimensions.width.tiny,
    borderRadius: UI_SIZES.radius.medium,
    borderColor: theme.palette.grey.cloudy,
    paddingVertical: UI_SIZES.spacing.medium,
    paddingRight: UI_SIZES.spacing.big,
    paddingLeft: UI_SIZES.spacing.medium,
    marginLeft: UI_SIZES.spacing.big,
  },
  footerIcon: {
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.medium,
  },
  footerText: {
    flex: 1,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkTaskList>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('Homework'),
  }),
});

export class HomeworkTaskListScreen extends React.PureComponent<IHomeworkTaskListScreenProps, IHomeworkTaskListScreenState> {
  state = {
    fetching: false,
    refreshing: false,
    pastDateLimit: today(),
  };

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    if (nextProps.isFetching !== prevState.fetching) {
      return { fetching: nextProps.isFetching };
    } else return null;
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerTitle: navBarTitle(this.props.diaryInformation?.title),
    });
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
    const { isFetching, didInvalidate, error } = this.props;
    const pageContent = isFetching && didInvalidate ? <Loading /> : error ? this.renderError() : this.renderList();

    return <PageView>{pageContent}</PageView>;
  }

  private renderError() {
    return <EmptyContentScreen />;
  }

  private renderList() {
    const { diaryId, tasksByDay, navigation, onRefresh, session } = this.props;
    const { refreshing, pastDateLimit } = this.state;
    const dataInfo: DataType[] = tasksByDay
      ? tasksByDay.map(day => ({
          type: 'day',
          title: day.date,
          data: day.tasks.map(task => ({
            ...task,
            date: day.date,
            type: 'day',
          })),
        }))
      : [];
    const hasHomework = dataInfo.length > 0;
    const pastHomework = dataInfo.filter(item => item.title.isBefore(today(), 'day'));
    const hasPastHomeWork = pastHomework.length > 0;
    const remainingPastHomework = pastHomework.filter(item => item.title.isBefore(pastDateLimit, 'day'));
    const displayedPastHomework = pastHomework.filter(item => item.title.isBetween(pastDateLimit, today(), 'day', '[)'));
    const futureHomework = dataInfo.filter(item => item.title.isSameOrAfter(today(), 'day'));
    const displayedHomework = [...displayedPastHomework, ...futureHomework];
    const isHomeworkDisplayed = displayedHomework.length > 0;
    const noRemainingPastHomework = remainingPastHomework.length === 0;
    const noFutureHomeworkHiddenPast = futureHomework.length === 0 && pastDateLimit.isSame(today(), 'day');
    const homeworkWorkflowInformation = session && getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;

    const stylesContentSectionList = {
      padding: hasHomework ? UI_SIZES.spacing.medium : undefined,
      paddingTop: hasHomework ? undefined : 0,
      flex: noFutureHomeworkHiddenPast ? 1 : undefined,
    };

    // Add footer only if there is at least one element
    // We must keep the empty state displaying if the list is empty.
    if (displayedHomework.length) (displayedHomework as DataTypeOrFooter[]).push({ type: 'footer', data: [{ type: 'footer' }] });

    return (
      <View style={styles.taskList}>
        {noFutureHomeworkHiddenPast ? null : <HomeworkTimeline leftPosition={UI_SIZES.spacing.medium + UI_SIZES.spacing.minor} />}
        <SectionList
          contentContainerStyle={stylesContentSectionList}
          sections={displayedHomework as DataType[]}
          CellRendererComponent={ViewOverflow}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title, type, data } }: { section: DataType }) => {
            if (type !== 'day') {
              return (
                <>
                  <HomeworkTimeline topPosition={UI_SIZES.spacing.large} leftPosition={UI_SIZES.spacing.minor} />
                  <View
                    style={{
                      marginTop: UI_SIZES.spacing.big,
                      marginBottom: UI_SIZES.spacing.small,
                    }}>
                    <Label color={theme.palette.grey.grey} text={I18n.t('homework.homeworkTaskListScreen.noFutureHomework')} />
                  </View>
                </>
              );
            } else {
              const isPastDate = title.isBefore(today(), 'day');
              const dayOfTheWeek = getDayOfTheWeek(title);
              const dayColor = theme.color.homework.days[dayOfTheWeek]?.accent ?? theme.palette.grey.cloudy;
              const timelineColor = isPastDate ? theme.palette.grey.cloudy : dayColor;
              return (
                <View
                  style={{
                    marginBottom: UI_SIZES.spacing.tiny,
                    marginTop: UI_SIZES.spacing.big,
                  }}>
                  <View style={styles.dayCheckpoint}>
                    <HomeworkDayCheckpoint date={title} />
                  </View>
                  <HomeworkTimeline
                    leftPosition={UI_SIZES.spacing.minor}
                    topPosition={UI_SIZES.spacing.tiny}
                    color={timelineColor}
                  />
                </View>
              );
            }
          }}
          renderItem={({ item, index }) =>
            (item as unknown as { type: string }).type !== 'day' ? (
              this.renderFooterItem(isHomeworkDisplayed)
            ) : (
              <HomeworkCard
                key={index}
                title={item.title}
                content={item.content}
                date={item.date}
                onPress={() => navigation!.navigate(`${config.name}/details`, { task: item })}
              />
            )
          }
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                this.setState({ fetching: true, refreshing: true });
                if (onRefresh && diaryId) {
                  await onRefresh(diaryId);
                }
                this.setState({ refreshing: false });
              }}
            />
          }
          // eslint-disable-next-line react/no-unstable-nested-components
          ListHeaderComponent={() => {
            const labelColor = noRemainingPastHomework ? theme.palette.grey.grey : theme.palette.grey.black;
            const labelText = I18n.t(
              `homework.homeworkTaskListScreen.${noRemainingPastHomework ? 'noMorePastHomework' : 'displayPastDays'}`,
            );
            return hasPastHomeWork ? (
              <TouchableOpacity
                style={styles.buttonPastHomework}
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
          ListEmptyComponent={
            noFutureHomeworkHiddenPast ? (
              <EmptyScreen
                svgImage="empty-hammock"
                title={I18n.t(
                  `homework-tasks-emptyScreenTitle${
                    hasPastHomeWork ? '' : hasCreateHomeworkResourceRight ? '-NoTasks' : '-NoTasks-NoCreationRights'
                  }`,
                )}
                text={I18n.t(
                  `homework-tasks-emptyScreenText${
                    hasPastHomeWork
                      ? hasCreateHomeworkResourceRight
                        ? ''
                        : '-NoCreationRights'
                      : hasCreateHomeworkResourceRight
                      ? '-NoTasks'
                      : '-NoTasks-NoCreationRights'
                  }`,
                )}
                buttonText={hasCreateHomeworkResourceRight ? I18n.t('homework-createActivity') : undefined}
                buttonUrl={`/homeworks#/view-homeworks/${diaryId}`}
                buttonAction={() => Trackers.trackEvent('Homework', 'GO TO', 'Create in Browser')}
              />
            ) : null
          }
        />
      </View>
    );
  }

  renderFooterItem = (isHomeworkDisplayed: boolean) =>
    isHomeworkDisplayed ? (
      <>
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Icon name="informations" color={theme.palette.grey.stone} size={TextSizeStyle.Huge.fontSize} />
          </View>
          <View style={styles.footerText}>
            <SmallText style={{ color: theme.palette.grey.graphite }}>
              {I18n.t('homework.homeworkTaskListScreen.noFutureHomeworkTryAgain')}
            </SmallText>
          </View>
        </View>
      </>
    ) : null;
}

export default HomeworkTaskListScreen;
