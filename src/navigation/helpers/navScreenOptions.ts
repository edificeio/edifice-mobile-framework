import { Platform } from 'react-native';
import deviceInfoModule from 'react-native-device-info';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

/**
 * Options for a header with centered title
 */
export const standardNavScreenOptions = (props, { state }) => {
  const { params = {} } = state;
  const { header } = params;

  return {
    header,
    headerTintColor: theme.ui.background.card,
    tabBarVisible: header !== null,
    headerBackTitle: null,
    ...props,
    headerStyle: {
      backgroundColor: theme.palette.primary.regular,
      elevation: 5,
      height: Platform.select({ ios: deviceInfoModule.hasNotch() ? 100 : 76, default: UI_SIZES.elements.navbarHeight }),
      ...(props.headerStyle || {}),
    },
    headerTitleStyle: {
      alignSelf: 'center',
      color: theme.ui.text.inverse,
      fontFamily: 'OpenSans-Regular',
      fontSize: 16,
      fontWeight: '400',
      textAlign: 'center',
      ...(props.headerTitleStyle || {}),
    },
    headerTitleContainerStyle: {
      left: 0,
      right: 0,
    },
  };
};

/**
 * Options for a header with left-aligned title
 */
export const alternativeNavScreenOptions = (props, navigation) =>
  standardNavScreenOptions(
    {
      headerTitleStyle: {
        alignSelf: 'center',
        color: theme.ui.text.inverse,
        fontFamily: 'OpenSans-Regular',
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'left',
        marginHorizontal: 0,
      },
      ...props,
    },
    navigation,
  );
