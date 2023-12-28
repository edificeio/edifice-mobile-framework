import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import DisplaySession from '~/framework/modules/viescolaire/diary/components/DisplaySession';
import { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.session>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('diary-session-title'),
  }),
});

class DiarySessionScreen extends React.PureComponent<any> {
  public render() {
    return (
      <PageView>
        <DisplaySession
          {...this.props}
          session={this.props.route.params.session}
          sessionList={this.props.route.params.sessionList}
        />
      </PageView>
    );
  }
}

export default DiarySessionScreen;
