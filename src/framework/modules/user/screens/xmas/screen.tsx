import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, SmallText } from '~/framework/components/text';
import { Toggle } from '~/framework/components/toggle';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import { UserXmasScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.xmas>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-xmas-title'),
  }),
});

const XmasScreen = ({ onSetXmasTheme, xmasTheme }: UserXmasScreenPrivateProps) => {
  return (
    <PageView>
      <View style={styles.textContainer}>
        <View style={styles.toggleContainer}>
          <BodyText>{I18n.get('user-xmas-activate')}</BodyText>
          <Toggle onCheckChange={() => onSetXmasTheme(!xmasTheme)} checked={xmasTheme} />
        </View>
        <SmallText>{I18n.get('user-xmas-description', { appName: DeviceInfo.getApplicationName() })}</SmallText>
      </View>
      <View style={styles.xmasTreeContainer}>
        <NamedSVG style={styles.xmasTree} name="xmas" width="110%" height="110%" />
      </View>
    </PageView>
  );
};

export default XmasScreen;
