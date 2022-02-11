/**
 * HomeworkTaskPage
 *
 * Display page for a task of a given day.
 */

// imports ----------------------------------------------------------------------------------------

import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NavigationInjectedProps, NavigationScreenProp } from 'react-navigation';

import theme from '~/app/theme';
import { TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { getDayOfTheWeek } from '~/framework/util/date';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { HeaderBackAction } from '~/ui/headers/NewHeader';
import MondayImage from 'ode-images/days/monday.svg';
import TuesdayImage from 'ode-images/days/tuesday.svg';
import WednesdayImage from 'ode-images/days/wednesday.svg';
import ThursdayImage from 'ode-images/days/thursday.svg';
import FridayImage from 'ode-images/days/friday.svg';
import SaturdayImage from 'ode-images/days/saturday.svg';
import HomeworkDayCheckpoint from '../components/HomeworkDayCheckpoint';

export interface IHomeworkTaskPageNavigationParams {
  task: {
    date: moment.Moment;
    id: string;
    title: string;
    content: string;
  };
}

export type IHomeworkTaskPageProps = NavigationInjectedProps<IHomeworkTaskPageNavigationParams>;

export class HomeworkTaskPage extends React.PureComponent<IHomeworkTaskPageProps, object> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return alternativeNavScreenOptions(
      {
        title: navigation.getParam('task').title || I18n.t('homework.homeworkTaskPage.homework'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation,
    );
  };

  render() {
    const { navigation } = this.props;
    const { date, title, content } = navigation.getParam('task');
    const dayOfTheWeek = getDayOfTheWeek(date);
    const dayColor = theme.days[dayOfTheWeek];
    const opacity = 80;
    const bannerColor = `${dayColor}${opacity}`;
    const dayImages = {
      monday: <MondayImage style={styles.dayImage} />,
      tuesday: <TuesdayImage style={styles.dayImage} />,
      wednesday: <WednesdayImage style={styles.dayImage} />,
      thursday: <ThursdayImage style={styles.dayImage} />,
      friday: <FridayImage style={styles.dayImage} />,
      saturday: <SaturdayImage style={styles.dayImage} />,
    };
    const dayImage = dayImages[dayOfTheWeek];

    return (
      <PageView>
        <View style={[styles.banner, { backgroundColor: bannerColor }]}>
          <View>
            <HomeworkDayCheckpoint date={date} />
          </View>
          {dayImage}
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

export default withViewTracking('homework/task')(HomeworkTaskPage);
