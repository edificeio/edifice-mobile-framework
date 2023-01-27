/**
 * All the logic needed for printing the snow flakes on screen
 */
import * as React from 'react';
import { Animated } from 'react-native';
import Snow from 'react-native-snow-bg';
import { NavigationFocusInjectedProps, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { importXmasThemeAction, letItSnowAction, setXmasThemeAction, stopItSnowAction } from '~/user/actions/xmas';

export interface SnowFlakesProps extends NavigationInjectedProps, NavigationFocusInjectedProps {}

interface SnowFlakesReduxProps extends SnowFlakesProps {
  isXmasActivated?: boolean;
  session: IUserSession;
  isFlakesFalling: boolean;
  handleImportXmasThemeAction: () => Promise<boolean>;
  letItSnow: () => Promise<void>;
  stopItSnow: () => Promise<void>;
  activateXmasTheme: () => Promise<void>;
}

function SnowFlakes(props: SnowFlakesReduxProps) {
  // Determine xmas theme setting here & if snow must falling
  const [snowfall, setSnowfall] = React.useState(false);
  const [fadeAnim, setFadeAnim] = React.useState(new Animated.Value(1));
  const wasFlaskesFalling = React.useRef(props.isFlakesFalling);

  const isXmasActivatedRef = React.useRef<boolean | undefined | null>(props.isXmasActivated);

  // End snow when go to another page
  React.useEffect(() => {
    const blurListener = props.navigation.addListener('didBlur', () => {
      props.stopItSnow();
    });
    return () => {
      blurListener.remove();
      props.stopItSnow();
    };
    // We want to execute this on mount/unmount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getShouldSnowFall = React.useCallback(
    async (p: SnowFlakesReduxProps, isSnowFalling: boolean, fadeAnimation: Animated.Value) => {
      // Check to let it snow / stop snow
      if (p.isFlakesFalling === true && wasFlaskesFalling.current !== true) {
        setSnowfall(true);
        setFadeAnim(new Animated.Value(1));
        wasFlaskesFalling.current = true;
      } else if (p.isFlakesFalling === false && wasFlaskesFalling.current !== false) {
        // stop snow if needed without condition
        const RND = Math.random();
        wasFlaskesFalling.current = false;
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          if (wasFlaskesFalling.current !== true) {
            setSnowfall(false);
            setFadeAnim(new Animated.Value(1));
          }
        });
      }

      // Check the user xmas preference here
      if (isXmasActivatedRef.current === undefined) {
        isXmasActivatedRef.current = null; // no value, but do not try to import then
        isXmasActivatedRef.current = await p.handleImportXmasThemeAction();
        if (isXmasActivatedRef.current !== false) {
          isXmasActivatedRef.current = true;
          props.letItSnow();
          props.activateXmasTheme();
        }
      }
    },
    [],
  );
  React.useEffect(() => {
    getShouldSnowFall(props, snowfall, fadeAnim);
    // We want to control whenever this check re-run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isXmasActivated, props.isFlakesFalling]);

  const snowStyle = React.useMemo(() => ({ position: 'absolute' as 'absolute', opacity: fadeAnim }), [fadeAnim]);
  const isSnowEligible = props.isXmasActivated !== false && props.isFocused && props.session?.user?.id; // No session, no flakes !

  return snowfall && isSnowEligible ? (
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
    activateXmasTheme: () => dispatch(setXmasThemeAction(true)),
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
