import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { UI_SIZES, getScaleDimension } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, SmallText } from '~/framework/components/text';
import { Toggle } from '~/framework/components/toggle';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

import { setXmasThemeAction } from '../actions/xmas';

const imageWidth = getScaleDimension(270, 'image');
const imageHeight = getScaleDimension(300, 'image');
const style = StyleSheet.create({
  textContainer: { paddingHorizontal: UI_SIZES.spacing.medium },
  toggleContainer: {
    flexDirection: 'row',
    paddingTop: UI_SIZES.spacing.large,
    paddingBottom: UI_SIZES.spacing.major,
    justifyContent: 'space-between',
  },
  xmasTreeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  xmasTree: {
    left: 80,
  },
});

class XmasScreenContainer extends React.PureComponent<
  NavigationInjectedProps<object> & { onSetXmasTheme: (xmasTheme: boolean) => void; xmasTheme: boolean }
> {
  render() {
    const { navigation, onSetXmasTheme, xmasTheme } = this.props;
    return (
      <PageView navigation={navigation} navBarWithBack={{ title: I18n.t('directory-xmasTitle') }}>
        <View style={style.textContainer}>
          <View style={style.toggleContainer}>
            <BodyText>{I18n.t('user.xmasScreen.activate')}</BodyText>
            <Toggle onCheckChange={() => onSetXmasTheme(!xmasTheme)} checked={xmasTheme} />
          </View>
          <SmallText>{I18n.t('user.xmasScreen.description', { appName: DeviceInfo.getApplicationName() })}</SmallText>
        </View>
        <View style={style.xmasTreeContainer}>
          <NamedSVG style={style.xmasTree} name="xmas" width={imageWidth} height={imageHeight} />
        </View>
      </PageView>
    );
  }
}

const XmasScreenConnected = connect(
  (state: any) => {
    const ret = {
      xmasTheme: state.user.xmas.xmasTheme,
    };
    return ret;
  },
  (dispatch: ThunkDispatch<any, void, AnyAction>) => ({
    dispatch,
    onSetXmasTheme(xmasTheme: boolean) {
      dispatch(setXmasThemeAction(xmasTheme));
    },
  }),
)(XmasScreenContainer);

export default withViewTracking('user/xmas')(XmasScreenConnected);
