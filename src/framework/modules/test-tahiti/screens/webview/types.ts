import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TestTahitiNavigationParams } from '~/framework/modules/test-tahiti/navigation';

export interface TestTahitiWebviewScreenProps {
  // @scaffolder add props here
}

export interface TestTahitiWebviewScreenNavParams {
  title: string;
  url: string;
}

export interface TestTahitiWebviewScreenPrivateProps
  extends NativeStackScreenProps<TestTahitiNavigationParams, 'webview'>,
    TestTahitiWebviewScreenProps {
  // @scaffolder add HOC props here
}
