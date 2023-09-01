import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
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
    title: route.params.diaryTitle ?? I18n.get('diary-homeworklist-title'),
  }),
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
    return <PageView>{content}</PageView>;
  }
}

export default DiaryHomeworkScreen;
