import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { TextColorStyle } from '~/framework/components/text';
import { Text } from '~/ui/Typography';

import { Picture, PictureProps } from './picture';

const style = StyleSheet.create({
  actions: {
    backgroundColor: theme.ui.background.card,
    position: 'absolute',
    right: 4,
    top: 0,
    zIndex: 10,
    borderRadius: 15,
    borderWidth: 0.2,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
  },
  overlayActions: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  separator: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: 1,
    width: '100%',
  },
  menuIconPicture: { width: 22, height: 22, marginLeft: UI_SIZES.spacing.small },
});

type ActionsMenuProps = {
  data: {
    text: string;
    icon: string | PictureProps;
    onPress: () => any;
  }[];
  onClickOutside: () => any;
  show: boolean;
};
export default class ActionsMenu extends React.PureComponent<ActionsMenuProps> {
  public render() {
    const { onClickOutside, show, data } = this.props;
    const RenderComp = () => {
      const insets = useSafeAreaInsets();
      return (
        <View style={[style.overlayActions, { top: UI_SIZES.elements.navbarHeight + insets.top }]}>
          <TouchableWithoutFeedback style={{ width: '100%', height: '100%' }} onPress={onClickOutside}>
            <FlatList
              style={style.actions}
              data={data}
              renderItem={({ item }) => {
                const itemColorStyle = item.icon === 'delete' ? TextColorStyle.Error : {};
                return (
                  <TouchableOpacity onPress={item.onPress}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: UI_SIZES.spacing.small,
                        paddingHorizontal: UI_SIZES.spacing.medium,
                      }}>
                      <Text style={{ ...itemColorStyle }}>{item.text}</Text>
                      {typeof item.icon === 'string' ? (
                        <Icon name={item.icon} size={22} style={{ marginLeft: UI_SIZES.spacing.small, ...itemColorStyle }} />
                      ) : (
                        <Picture
                          fill={theme.ui.text.regular}
                          {...item.icon}
                          width={22}
                          height={22}
                          size={22}
                          style={style.menuIconPicture}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              refreshing={false}
              ItemSeparatorComponent={() => <View style={style.separator} />}
            />
          </TouchableWithoutFeedback>
        </View>
      );
    };
    if (!show) return <></>;
    return <RenderComp />;
  }
}
