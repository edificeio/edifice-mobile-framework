import React from 'react';
import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const useStyles = (app: AppsInfoAggregated) => {
  const appColor = app.color;
  const themeMainColor = theme.palette.complementary;
  const backgroundColor = appColor && themeMainColor[appColor] ? themeMainColor[appColor].regular : undefined;

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignItems: 'center',
          backgroundColor,
          borderColor: theme.palette.grey.cloudy,
          borderRadius: UI_SIZES.radius.newCard,
          borderWidth: getScaleWidth(0.85),
          height: getScaleWidth(120),
          justifyContent: 'center',
          //   overflow: 'visible',
          position: 'relative',
          width: getScaleWidth(120),
        },
        favoriteIcon: {
          left: -getScaleWidth(20),
          padding: UI_SIZES.spacing.tiny,
          position: 'absolute',
          top: -UI_SIZES.spacing.medium,
          zIndex: UI_SIZES.spacing.tinyExtra,
        },
        image: {
          borderRadius: UI_SIZES.radius.newCard,
          height: '100%',
          objectFit: 'fill',
          width: '100%',
        },
        title: {
          textAlign: 'center',
        },
        titleRow: {
          alignContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          gap: UI_SIZES.spacing.tiny,
          marginTop: UI_SIZES.spacing.small,
          padding: 0,
        },
        wrapper: {
          alignItems: 'center',
        },
      }),
    [backgroundColor],
  );

  return styles;
};
