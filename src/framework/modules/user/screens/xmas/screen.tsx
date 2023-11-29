import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, SmallText } from '~/framework/components/text';
import { Toggle } from '~/framework/components/toggle';
import { setXmasMusicAction, setXmasThemeAction } from '~/framework/modules/user/actions';
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

const XmasScreen = ({ onSetXmasMusic, onSetXmasTheme, xmasMusic, xmasTheme }: UserXmasScreenPrivateProps) => {
  return (
    <PageView style={styles.page}>
      <SmallText style={{ color: 'orange' }}>{xmasTheme ? 'THEME ON' : 'THEME OFF'}</SmallText>
      <SmallText style={{ color: 'pink' }}>{xmasMusic ? 'MUSIC ON' : 'MUSIC OFF'}</SmallText>
      <SmallText>{I18n.get('user-xmas-description-temporary')}</SmallText>
      <View style={styles.toggleContainer}>
        <BodyText>{I18n.get('user-xmas-activate-theme')}</BodyText>
        <Toggle onCheckChange={() => onSetXmasTheme(!xmasTheme)} checked={xmasTheme} />
      </View>
      <View style={styles.toggleContainer}>
        <BodyText style={!xmasTheme && { color: theme.palette.grey.grey }}>{I18n.get('user-xmas-activate-music')}</BodyText>
        <Toggle disabled={!xmasTheme} onCheckChange={() => onSetXmasMusic(!xmasMusic)} checked={xmasMusic} />
      </View>
      <View style={styles.informationContainer}>
        <View style={styles.informationBar} />
        <NamedSVG
          name="ui-infoCircle"
          style={styles.informationIcon}
          fill={theme.palette.complementary.blue.regular}
          width={UI_SIZES.dimensions.width.larger}
          height={UI_SIZES.dimensions.height.larger}
        />
        <SmallText numberOfLines={2} style={styles.hintText}>
          {I18n.get('user-xmas-description-hint')}
        </SmallText>
      </View>
      <View style={styles.xmasTreeContainer}>
        <View style={styles.wishTextContainer}>
          <SmallText>{I18n.get('user-xmas-description-wish', { appName: DeviceInfo.getApplicationName() })}</SmallText>
        </View>
        <View style={styles.xmasTreeSubcontainer}>
          <NamedSVG style={styles.xmasTree} name="xmas" width="140%" height="70%" />
        </View>
      </View>
    </PageView>
  );
};

const XmasScreenConnected = connect(
  (state: any) => ({
    xmasMusic: state.user.xmasMusic,
    xmasTheme: state.user.xmasTheme,
  }),
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    dispatch,
    onSetXmasMusic(xmasMusic: boolean) {
      dispatch(setXmasMusicAction(xmasMusic));
    },
    onSetXmasTheme(xmasTheme: boolean) {
      dispatch(setXmasThemeAction(xmasTheme));
    },
  }),
)(XmasScreen);

export default XmasScreenConnected;
