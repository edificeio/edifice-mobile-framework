/**
 * What the two sheets of « Mes applis » share (`myapps/menu`, `myapps/app-actions`): they were the two modes of one bottom sheet of the
 * old screen (§4 n° 8 of the migration sheet). A component of the module, not a template: the sheets are screens of their own.
 */
import * as React from 'react';
import { View } from 'react-native';

import { SheetView } from '~/app/navigation-new';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';

import { styles } from './styles';

/** The content of a sheet, with its spacing. */
export const Sheet = ({ children }: React.PropsWithChildren) => {
  return (
    <SheetView>
      <View style={styles.container}>{children}</View>
    </SheetView>
  );
};

/** Icon of a line of a sheet (`MyAppsMenuItem`). */
export const MenuIcon = ({ name }: { name: SvgIconName }) => (
  <Svg name={name} width={UI_SIZES.spacing.big} height={UI_SIZES.spacing.big} fill={theme.palette.grey.black} />
);

export const Separator = () => <View style={styles.separatorLine} />;
