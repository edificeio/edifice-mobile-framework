import React from 'react';
import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const useStyles = (app?: AppsInfoAggregated) => {
  const appColor = app?.color;
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
          height: getScaleWidth(88),
          justifyContent: 'center',
          //   overflow: 'visible',
          position: 'relative',
          width: getScaleWidth(88),
        },
        contentContainer: {
          alignItems: 'center',
          width: '100%',
        },

        favoriteIcon: {
          left: -getScaleWidth(15),
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
        letterFallbackStyle: {
          color: theme.ui.text.inverse,
          fontSize: UI_SIZES.spacing.large,
          includeFontPadding: false,
          lineHeight: UI_SIZES.spacing.large * 1.2,
          textAlignVertical: 'center',
        },
        title: {
          textAlign: 'center',
        },
        titleRow: {
          alignContent: 'space-between',
          alignItems: 'center',
          columnGap: UI_SIZES.spacing.tiny,
          flexDirection: 'row',
          marginTop: UI_SIZES.spacing.small,
        },
        wrapper: {
          alignItems: 'center',
          borderRadius: UI_SIZES.radius.newCard,
          minHeight: getScaleWidth(134),
          paddingHorizontal: UI_SIZES.spacing.minor,
          paddingVertical: UI_SIZES.spacing.small,
          width: getScaleWidth(168),
        },
        wrapperPressed: {
          backgroundColor: theme.palette.grey.cloudy,
        },
      }),
    [backgroundColor],
  );

  return styles;
};
