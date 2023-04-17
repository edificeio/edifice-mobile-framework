import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { HeadingSText, TextSizeStyle } from '~/framework/components/text';
import HomeworkDayCheckpoint from '~/framework/modules/homework/components/HomeworkDayCheckpoint';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
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

export interface IHomeworkTaskDetailsScreenNavigationParams {
  task: {
    date: moment.Moment;
    id: string;
    title: string;
    content: string;
  };
}

export type IHomeworkTaskDetailsScreenProps = NativeStackScreenProps<
  HomeworkNavigationParams,
  typeof homeworkRouteNames.homeworkTaskDetails
>;

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
  render() {
    const { route } = this.props;
    const { date, title, content } = route.params.task;
    const dayOfTheWeek = getDayOfTheWeek(date);
    const dayColor = theme.color.homework.days[dayOfTheWeek].background;
    const opacity = 80;
    const bannerColor = `${dayColor}${opacity}`;
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
      </PageView>
    );
  }
}

export default HomeworkTaskDetailsScreen;
