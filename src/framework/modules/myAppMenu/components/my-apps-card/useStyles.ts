import React from 'react';
import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const useStyles = (appColor?: string) => {
  const themeMainColor = theme.palette.complementary;
  const backgroundColor = appColor && themeMainColor[appColor] ? themeMainColor[appColor].regular : theme.palette.grey.cloudy;

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignItems: 'center',
          backgroundColor,
          borderRadius: UI_SIZES.radius.newCard,
          height: 120,
          justifyContent: 'center',
          overflow: 'hidden',
          width: 120,
        },
        image: {
          borderRadius: UI_SIZES.radius.newCard,
          height: '100%',
          objectFit: 'fill',
          width: '100%',
        },
        title: {
          marginTop: UI_SIZES.spacing.small,
          textAlign: 'center',
        },
        wrapper: {
          alignItems: 'center',
        },
      }),
    [backgroundColor],
  );

  return styles;
};
