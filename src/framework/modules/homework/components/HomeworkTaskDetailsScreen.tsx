import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { Moment } from 'moment';
import * as React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import CheckboxButton from '~/framework/components/buttons/checkbox';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { HeadingSText, TextSizeStyle } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import HomeworkDayCheckpoint from '~/framework/modules/homework/components/HomeworkDayCheckpoint';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { IHomeworkDiary } from '~/framework/modules/homework/reducers/diaryList';
import {
  deleteHomeworkEntryResourceRight,
  getHomeworkWorkflowInformation,
  hasPermissionManager,
} from '~/framework/modules/homework/rights';
import { getDayOfTheWeek } from '~/framework/util/date';
import { Trackers } from '~/framework/util/tracker';
import HtmlContentView from '~/ui/HtmlContentView';

const dayImages = {
  monday: 'days-monday',
  tuesday: 'days-tuesday',
  wednesday: 'days-wednesday',
  thursday: 'days-thursday',
  friday: 'days-friday',
  saturday: 'days-saturday',
};

export interface HomeworkTaskDetailsScreenDataProps {
  diaryInformation?: IHomeworkDiary;
  session?: AuthLoggedAccount;
}

export interface HomeworkTaskDetailsScreenEventProps {
  handleDeleteHomeworkEntry(diaryId: string, entryId: string, date: Moment): Promise<void>;
  handleToggleHomeworkEntryStatus(diaryId: string, entryId: string, finished: boolean): Promise<void>;
  handleGetHomeworkTasks(diaryId: string): Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IHomeworkTaskDetailsScreenProps = HomeworkTaskDetailsScreenDataProps &
  HomeworkTaskDetailsScreenEventProps &
  NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkTaskDetails>;

const styles = StyleSheet.create({
  page: {
    backgroundColor: theme.ui.background.card,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    aspectRatio: 3,
  },
  checkboxButtonContainer: {
    position: 'absolute',
    right: UI_SIZES.spacing.medium,
    bottom: UI_SIZES.spacing.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowColor: theme.ui.shadowColor,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  checkboxContainer: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  checkboxListItem: {
    borderRadius: UI_SIZES.spacing.medium,
  },
  confetti: {
    height: getScaleHeight(80),
  },
  confettiContainer: {
    width: '100%',
    position: 'absolute',
    bottom: UI_SIZES.spacing.small,
  },
  content: {
    ...TextSizeStyle.Medium,
    marginTop: UI_SIZES.spacing.medium,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  dayImage: {
    height: '100%',
    aspectRatio: 1,
  },
});

export class HomeworkTaskDetailsScreen extends React.PureComponent<IHomeworkTaskDetailsScreenProps, object> {
  state = {
    checked: this.props.route.params.task.finished,
  };

  async doDeleteDiaryEntry(diaryId: string, entryId: string, date: Moment) {
    try {
      const { handleDeleteHomeworkEntry, handleGetHomeworkTasks, navigation } = this.props;
      if (!diaryId || !entryId || !date) {
        throw new Error('failed to call api (missing information)');
      }

      await handleDeleteHomeworkEntry(diaryId, entryId, date);
      await handleGetHomeworkTasks(diaryId);
      navigation.goBack();
    } catch {
      Toast.showError(I18n.get('homework-taskdetails-deletion-error'));
    }
  }

  async doToggleDiaryEntryStatus(finished: boolean) {
    try {
      const { handleToggleHomeworkEntryStatus, handleGetHomeworkTasks, route } = this.props;
      const { checked } = this.state;
      const diaryId = route.params.diaryId;
      const taskId = route.params.task.taskId;
      if (!diaryId || !taskId) {
        throw new Error('failed to call api (missing information)');
      }

      await handleToggleHomeworkEntryStatus(diaryId, taskId, finished);
      await handleGetHomeworkTasks(diaryId);
      this.setState({ checked: !checked });
    } catch {
      Toast.showError(I18n.get('homework-taskdetails-status-error'));
    }
  }

  updateNavBarTitle() {
    const { diaryInformation, route, navigation, session } = this.props;
    const hasDeletionRight =
      session &&
      (hasPermissionManager(diaryInformation!, deleteHomeworkEntryResourceRight, session) ||
        diaryInformation?.owner.userId === session.user.id);
    const diaryId = route.params.diaryId;
    const task = route.params.task;
    const taskId = task.taskId;
    const date = task.date;
    const menuData = [
      deleteAction({
        action: () => {
          Alert.alert(I18n.get('homework-taskdetails-deletion-title'), I18n.get('homework-taskdetails-deletion-text'), [
            {
              text: I18n.get('common-cancel'),
              style: 'default',
            },
            {
              text: I18n.get('common-delete'),
              style: 'destructive',
              onPress: () => {
                this.doDeleteDiaryEntry(diaryId, taskId, date);
              },
            },
          ]);
        },
      }),
    ];

    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () =>
        hasDeletionRight ? (
          <PopupMenu actions={menuData}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        ) : undefined,
    });
  }

  componentDidMount() {
    this.updateNavBarTitle();
  }

  render() {
    const { route, session } = this.props;
    const { checked } = this.state;
    const { date, title, content } = route.params.task;
    const dayOfTheWeek = getDayOfTheWeek(date);
    const dayColor = theme.color.homework.days[dayOfTheWeek].background;
    const opacity = 80;
    const bannerColor = `${dayColor}${opacity}`;
    const homeworkWorkflowInformation = session && getHomeworkWorkflowInformation(session);
    const hasCheckHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.check;
    const animationSource = require('ASSETS/animations/homework/done.json');

    return (
      <PageView style={styles.page}>
        <View style={[styles.banner, { backgroundColor: bannerColor }]}>
          <View>
            <HomeworkDayCheckpoint date={date} />
          </View>
          <NamedSVG name={dayImages[dayOfTheWeek]} style={styles.dayImage} />
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {title ? <HeadingSText>{title}</HeadingSText> : null}
          {content ? (
            <HtmlContentView
              html={content}
              opts={{ globalTextStyle: styles.content }}
              onDownload={() => Trackers.trackEvent('Homeworks', 'DOWNLOAD ATTACHMENT', 'Read mode')}
              onError={() => Trackers.trackEvent('Homeworks', 'DOWNLOAD ATTACHMENT ERROR', 'Read mode')}
              onDownloadAll={() => Trackers.trackEvent('Homeworks', 'DOWNLOAD ALL ATTACHMENTS', 'Read mode')}
              onOpen={() => Trackers.trackEvent('Homeworks', 'OPEN ATTACHMENT', 'Read mode')}
            />
          ) : null}
        </ScrollView>
        {hasCheckHomeworkResourceRight ? (
          <View style={styles.checkboxButtonContainer}>
            <CheckboxButton
              title="homework-taskdetails-status-done"
              onPress={() => this.doToggleDiaryEntryStatus(!checked)}
              isChecked={checked}
              customListItemStyle={styles.checkboxListItem}
              customCheckboxContainerStyle={styles.checkboxContainer}
            />
            {checked ? (
              <View pointerEvents="none" style={styles.confettiContainer}>
                <LottieView source={animationSource} style={styles.confetti} resizeMode="cover" loop={false} autoPlay />
              </View>
            ) : null}
          </View>
        ) : null}
      </PageView>
    );
  }
}

export default HomeworkTaskDetailsScreen;
