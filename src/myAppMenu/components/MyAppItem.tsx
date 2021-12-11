import React from 'react';
import { StyleSheet, View } from 'react-native';

import { H1, TextColorStyle } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';
import { Icon } from '~/ui';
import { TouchCard } from '~/ui/Card';
import { checkHasIcon } from '~/ui/icons/Icon';

const MyAppItemStyle = StyleSheet.create({
  gridItem: {
    flex: 0,
    padding: 20,
    width: '50%',
    aspectRatio: 1,
  },
  touchCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  textStyle: {
    ...TextColorStyle.Normal,
    fontSize: layoutSize.LAYOUT_14,
    textAlign: 'center',
    marginBottom: 0,
    marginTop: 0,
    marginHorizontal: 0,
    padding: 0,
  },
});

export interface IMyAppItem {
  iconColor: string;
  displayName: string;
  iconName: string;
  onPress: () => void;
}

export default (props: IMyAppItem) => {
  return (
    <View style={MyAppItemStyle.gridItem}>
      <TouchCard style={MyAppItemStyle.touchCard} onPress={props.onPress}>
        <Icon
          color={props.iconColor}
          size={layoutSize.LAYOUT_50}
          name={checkHasIcon(props.iconName) ? props.iconName : props.iconName + '-on'}
        />
        <H1 style={MyAppItemStyle.textStyle}>{props.displayName}</H1>
      </TouchCard>
    </View>
  );
};
