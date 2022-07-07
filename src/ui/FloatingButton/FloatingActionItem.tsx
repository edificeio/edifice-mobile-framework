import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';
import { EVENT_TYPE, IEventProps } from '~/types';
import { CenterPanel, LeftIconPanel } from '~/ui/ContainerContent';
import { IMenuItem } from '~/ui/types';

const styles = StyleSheet.create({
  centerPanel: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 3,
    justifyContent: 'flex-start',
    margin: UI_SIZES.spacing.tiny,
    marginLeft: -UI_SIZES.spacing.medium,
  },
  text: {
    color: 'black',
  },
  leftPanel: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: layoutSize.LAYOUT_58,
    flexGrow: 0,
    margin: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.tiny,
  },
  touchPanel: {
    flexDirection: 'row',
    flex: 1,
    paddingLeft: UI_SIZES.spacing.tiny,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

const Item = ({ onEvent, item, eventHandleData }: IEventProps & any) => {
  const { icon, text } = item as IMenuItem;

  const view = (
    <View style={styles.touchPanel}>
      <LeftIconPanel style={styles.leftPanel}>
        <Icon color="#000000" size={layoutSize.LAYOUT_28} name={icon} />
      </LeftIconPanel>
      <CenterPanel style={styles.centerPanel}>
        <Text numberOfLines={1} style={styles.text}>
          {text}
        </Text>
      </CenterPanel>
    </View>
  );

  if (item.wrapper) {
    const ItemWrapper = item.wrapper;
    return <ItemWrapper {...eventHandleData}>{view}</ItemWrapper>;
  } else {
    return <TouchableOpacity onPress={() => onEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item })}>{view}</TouchableOpacity>;
  }
};

export default Item;
