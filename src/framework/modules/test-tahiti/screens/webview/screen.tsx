import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

import { PageView } from '~/framework/components/page';
import { TestTahitiNavigationParams, testTahitiRouteNames } from '~/framework/modules/test-tahiti/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Loading } from '~/ui/Loading';

import type { TestTahitiWebviewScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<TestTahitiNavigationParams, typeof testTahitiRouteNames.webview>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.title,
  }),
});

export default function TestTahitiWebviewScreen(props: TestTahitiWebviewScreenPrivateProps) {
  return (
    <PageView>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          javaScriptEnabled
          onError={ev => {
            alert('onError:' + ev.nativeEvent);
          }}
          onHttpError={ev => {
            alert('onError:' + ev.nativeEvent.statusCode + ' - ' + ev.nativeEvent.description);
          }}
          renderLoading={() => <Loading />}
          scalesPageToFit
          showsHorizontalScrollIndicator={false}
          source={{ uri: props.route.params.url }}
          setSupportMultipleWindows={false}
          startInLoadingState
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </PageView>
  );
}
