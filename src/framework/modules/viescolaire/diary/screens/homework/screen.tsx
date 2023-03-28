import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import DisplayHomework from '~/framework/modules/viescolaire/diary/components/DisplayHomework';
import DisplayListHomework from '~/framework/modules/viescolaire/diary/components/DisplayListHomework';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.homework>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: route.params.diaryTitle ?? I18n.t('Homework'),
  headerStyle: {
    backgroundColor: viescoTheme.palette.diary,
  },
});

class DiaryHomeworkScreen extends React.PureComponent<any> {
  public render() {
    const content =
      this.props.route.params.homework === undefined ? (
        // Displayed when user is a teacher
        <DisplayListHomework
          {...this.props}
          subject={this.props.route.params.subject}
          homeworkList={this.props.route.params.homeworkList}
        />
      ) : (
        <DisplayHomework
          {...this.props}
          homework={this.props.route.params.homework}
          homeworkList={this.props.route.params.homeworkList}
        />
      );
    return (
      <GestureHandlerRootView style={UI_STYLES.flex1}>
        <PageView>{content}</PageView>
      </GestureHandlerRootView>
    );
  }
}

export default DiaryHomeworkScreen;
