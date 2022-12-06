/**
 * All the logic needed for printing the snow flakes on screen
 */
import * as React from 'react';
import { Animated, EmitterSubscription, Vibration } from 'react-native';
import RNShake from 'react-native-shake';
import Snow from 'react-native-snow-bg';
import { NavigationFocusInjectedProps, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { importXmasThemeAction, letItSnowAction, stopItSnowAction } from '~/user/actions/xmas';

import { IUserSession, getUserSession } from '../util/session';

export interface SnowFlakesProps extends NavigationInjectedProps, NavigationFocusInjectedProps {}

interface SnowFlakesReduxProps extends SnowFlakesProps {
  isXmasActivated?: boolean;
  session: IUserSession;
  isFlakesFalling: boolean;
  handleImportXmasThemeAction: () => Promise<boolean>;
  letItSnow: () => Promise<void>;
  stopItSnow: () => Promise<void>;
}

let isFirstScreenEver = true;
let hasXmasAutoShowFlakesOnce = false;
let previousUserId: string | undefined;

let shakeListener: EmitterSubscription | undefined;

function SnowFlakes(props: SnowFlakesReduxProps) {
  // Determine xmas theme setting here & if snow must falling
  const [snowfall, setSnowfall] = React.useState(false);
  const [fadeAnim, setFadeAnim] = React.useState(new Animated.Value(1));

  const isXmasActivatedRef = React.useRef<boolean | undefined | null>(props.isXmasActivated);
  const hasAutoShowFlakesOnce = React.useRef<boolean>(false);
  const shouldHideFlakesRef = React.useRef<boolean>(props.isFlakesFalling);

  if ((previousUserId === undefined && props.session?.user?.id !== undefined) || previousUserId !== props.session?.user?.id) {
    // We just log in
    isFirstScreenEver = true;
    hasXmasAutoShowFlakesOnce = false;
    previousUserId = props.session?.user?.id;
  }

  React.useEffect(() => {
    if (!props.session?.user?.id) return; // No session, no flakes !
    const blurListener = props.navigation.addListener('didBlur', () => {
      if (props.isXmasActivated === false) return;
      hasXmasAutoShowFlakesOnce = false;
      props.stopItSnow();
    });
    if (!shakeListener && props.isXmasActivated !== false) {
      shakeListener = RNShake.addListener(() => {
        if (props.isXmasActivated === false) return;
        Vibration.vibrate();
        props.letItSnow();
      });
    }
    return () => {
      blurListener.remove();
      if (props.isXmasActivated === false) return;
      props.stopItSnow();
      if (shakeListener) {
        shakeListener.remove();
        shakeListener = undefined;
      }
    };
    // We want to execute this on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isXmasActivated]);

  const getShouldSnowFall = React.useCallback(
    async (p: SnowFlakesReduxProps, isSnowFalling: boolean, fadeAnimation: Animated.Value) => {
      if (!p.session?.user?.id) return; // No session, no flakes !
      if (p.navigation.state.routeName === 'Xmas' && hasXmasAutoShowFlakesOnce === false && p.isFocused) {
        p.isFlakesFalling = true;
        shouldHideFlakesRef.current = true;
        hasAutoShowFlakesOnce.current = false; // will be true at the bottom
        hasXmasAutoShowFlakesOnce = true;
      }
      if (p.isFlakesFalling === false && shouldHideFlakesRef.current === true) {
        // stop snow if needed without condition
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setSnowfall(false);
          setFadeAnim(new Animated.Value(1));
        });
      }
      if (!p.session?.user?.id) return; // No session, no flakes !
      shouldHideFlakesRef.current = p.isFlakesFalling;
      if (isXmasActivatedRef.current === undefined) {
        isXmasActivatedRef.current = null; // no value, but do not try to import then
        isXmasActivatedRef.current = await p.handleImportXmasThemeAction();
      }
      if (isXmasActivatedRef.current !== false) {
        if (p.navigation.state.routeName === 'Xmas' && hasAutoShowFlakesOnce.current === false) {
          hasAutoShowFlakesOnce.current = true;
          if (isXmasActivatedRef.current || p.isXmasActivated) {
            p.letItSnow();
          }
        }
        if (isFirstScreenEver === true && hasXmasAutoShowFlakesOnce === false && p.navigation.state.routeName === 'timeline') {
          hasXmasAutoShowFlakesOnce = true;
          isFirstScreenEver = false;
          p.letItSnow();
        }
        if (p.isFocused && p.isFlakesFalling) {
          if (isSnowFalling === false) {
            setSnowfall(true);
          }
        }
      }
    },
    [],
  );
  React.useEffect(() => {
    getShouldSnowFall(props, snowfall, fadeAnim);
  }, [props, getShouldSnowFall, snowfall, fadeAnim]);

  const snowStyle = React.useMemo(() => ({ position: 'absolute' as 'absolute', opacity: fadeAnim }), [fadeAnim]);

  return snowfall && props.isXmasActivated !== false ? (
    <Animated.View style={snowStyle}>
      <Snow fullScreen snowflakesCount={150} fallSpeed="medium" />
    </Animated.View>
  ) : null;
}

const SnowFlakesConnected = connect(
  (state: IGlobalState) => ({
    isXmasActivated: state.user.xmas.xmasTheme,
    isFlakesFalling: state.user.xmas.flakesFaling,
    session: getUserSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    handleImportXmasThemeAction: () => dispatch(importXmasThemeAction()),
    letItSnow: () => dispatch(letItSnowAction()),
    stopItSnow: () => dispatch(stopItSnowAction()),
  }),
)(SnowFlakes);

export default connect((state: IGlobalState) => ({
  isXmasActivated: state.user.xmas.xmasTheme,
  session: getUserSession(),
}))(
  ({
    isXmasActivated,
    navigation,
    isFocused,
    session,
  }: { isXmasActivated?: boolean; session: IUserSession } & NavigationInjectedProps & NavigationFocusInjectedProps) => {
    return session?.user?.id ? (
      <SnowFlakesConnected
        navigation={navigation}
        isFocused={isFocused}
        key={isXmasActivated ? isXmasActivated.toString() : 'undefined'}
      />
    ) : null;
  },
);
