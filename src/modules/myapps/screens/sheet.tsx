/**
 * What the two sheets of « Mes applis » share (`myapps/menu`, `myapps/app-actions`): they were the two modes of one bottom sheet of the
 * old screen (§4 n° 8 of the migration sheet).
 */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { SheetView } from '~/app/navigation-new/layout';
import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';

/** Options of the sheets, returned by the `options` of `defineModal`: a native form sheet as high as its content, with no header. */
export const sheetOptions = (): NativeStackNavigationOptions => ({
  headerShown: false,
  presentation: 'formSheet',
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
});

export const sheetStyles = StyleSheet.create({
  container: {
    paddingBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.big,
  },
  infoMessageItem: {
    backgroundColor: theme.palette.complementary.blue.pale,
    marginLeft: getScaleWidth(34) + UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  separatorLine: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    marginVertical: UI_SIZES.spacing.minor,
    width: '100%',
  },
});

/** The content of a sheet, with its spacing. */
export const Sheet = ({ children }: React.PropsWithChildren) => {
  return (
    <SheetView>
      <View style={sheetStyles.container}>{children}</View>
    </SheetView>
  );
};

/** Icon of a line of a sheet (`MyAppsMenuItem`). */
export const MenuIcon = ({ name }: { name: SvgIconName }) => (
  <Svg name={name} width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} fill={theme.palette.grey.black} />
);

export const Separator = () => <View style={sheetStyles.separatorLine} />;
