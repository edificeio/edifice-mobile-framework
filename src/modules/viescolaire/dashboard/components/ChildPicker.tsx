import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { IChild, IChildArray } from '~/modules/viescolaire/dashboard/state/children';
import Dropdown from '~/ui/Dropdown';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.medium,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: theme.palette.grey.white,
    zIndex: 100,
  },
  shadow: {
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
});

interface IChildPickerProps {
  selectedChildId: string;
  childrenArray: IChildArray;
  children?: JSX.Element | JSX.Element[];
  selectChild: (child: string) => void;
}

export const ChildPicker = ({ selectedChildId, childrenArray, children, selectChild }: IChildPickerProps) => (
  <View style={[styles.container, styles.shadow]}>
    <Dropdown
      data={childrenArray}
      value={selectedChildId}
      onSelect={(child: string) => {
        if (child !== selectedChildId) {
          selectChild(child);
        }
      }}
      title={I18n.t('viesco-pickChild')}
      keyExtractor={item => item.id}
      renderItem={(item: IChild) => item.lastName + ' ' + item.firstName}
    />
    {children}
  </View>
);
