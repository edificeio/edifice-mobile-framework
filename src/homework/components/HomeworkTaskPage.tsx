/**
 * HomeworkTaskPage
 *
 * Display page for just one task just one day.
 */

// imports ----------------------------------------------------------------------------------------

import style from 'glamorous-native';
import I18n from 'i18n-js';
import { Moment } from 'moment';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { Text } from '~/framework/components/text';
import { Trackers } from '~/framework/util/tracker';
import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

const { ScrollView } = style;

// Main component ---------------------------------------------------------------------------------

export interface IHomeworkTaskPageDataProps {
  diaryId?: string;
  date?: Moment;
  taskId?: string;
  taskTitle?: string;
  taskContent?: string;
}

export interface IHomeworkTaskPageOtherProps {
  navigation?: any;
}

export type IHomeworkTaskPageProps = IHomeworkTaskPageDataProps & IHomeworkTaskPageOtherProps;

/*
const convert = memoize(
  html =>
    HtmlToJsx(html, {
      formatting: true,
      hyperlinks: true,
      iframes: true,
      images: true
    }).render
);
*/

export class HomeworkTaskPage extends React.PureComponent<IHomeworkTaskPageProps, object> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    // console.log("title", navigation.getParam('title'));
    return alternativeNavScreenOptions(
      {
        title: navigation.getParam('title') || I18n.t('homework-task-empty-title'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation,
    );
  };

  constructor(props: IHomeworkTaskPageProps) {
    super(props);
  }

  // render & lifecycle

  public render() {
    const { date, taskContent } = this.props;
    let formattedDate = date!.format('dddd LL');
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
      <PageContainer>
        <ScrollView
          alwaysBounceVertical={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
          <Text>{formattedDate}</Text>
          {/*<View paddingTop={20}>{convert(taskContent)}</View>*/}
          <HtmlContentView
            style={{ paddingTop: 20 }}
            html={taskContent}
            onDownload={att => Trackers.trackEvent('Homeworks', 'DOWNLOAD ATTACHMENT', 'Read mode')}
            onError={att => Trackers.trackEvent('Homeworks', 'DOWNLOAD ATTACHMENT ERROR', 'Read mode')}
            onDownloadAll={() => Trackers.trackEvent('Homeworks', 'DOWNLOAD ALL ATTACHMENTS', 'Read mode')}
            onOpen={() => Trackers.trackEvent('Homeworks', 'OPEN ATTACHMENT', 'Read mode')}
          />
        </ScrollView>
      </PageContainer>
    );
  }
}

export default HomeworkTaskPage;
