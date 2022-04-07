import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { getDayOfTheWeek } from '~/framework/util/date';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import HomeworkDayCheckpoint from '../components/HomeworkDayCheckpoint';
import config from '../config';

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

export type IHomeworkTaskDetailsScreenProps = NavigationInjectedProps<IHomeworkTaskDetailsScreenNavigationParams>;

export class HomeworkTaskDetailsScreen extends React.PureComponent<IHomeworkTaskDetailsScreenProps, object> {
  render() {
    const { navigation } = this.props;
    const { date, title, content } = navigation.getParam('task');
    const dayOfTheWeek = getDayOfTheWeek(date);
    const dayColor = theme.days[dayOfTheWeek];
    const opacity = 80;
    const bannerColor = `${dayColor}${opacity}`;
    return (
      <PageView navigation={navigation} navBarWithBack={{}}>
        <View style={[styles.banner, { backgroundColor: bannerColor }]}>
          <View>
            <HomeworkDayCheckpoint date={date} />
          </View>
          <NamedSVG name={dayImages[dayOfTheWeek]} style={styles.dayImage} />
        </View>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {title ? <TextSemiBold style={styles.title}>{title}</TextSemiBold> : null}
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

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.smallPlus,
    aspectRatio: 3,
  },
  content: {
    ...TextSizeStyle.SlightBig,
    marginTop: UI_SIZES.spacing.mediumPlus,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.large,
  },
  dayImage: {
    height: '100%',
    aspectRatio: 1,
  },
  title: {
    ...TextSizeStyle.Big,
  },
});

export default withViewTracking(`${config.name}/details`)(HomeworkTaskDetailsScreen);
