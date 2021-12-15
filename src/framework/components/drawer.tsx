import I18n from 'i18n-js';
import * as React from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback, TextStyle } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import { ANIMATION_CONFIGURATIONS, UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { Weight } from '~/ui/Typography';

const ITEM_HEIGHT = 45;
const LIST_RADIUS = 20;

const DROPDOWN_HEIGHT = UI_SIZES.getViewHeight() - ITEM_HEIGHT;
const LIST_MAX_HEIGHT = DROPDOWN_HEIGHT + LIST_RADIUS;

export interface IDrawerProps {
  items: {
    name: string;
    value: string;
    iconName?: string;
    depth?: number;
    count?: number;
    labelStyle?: TextStyle;
    closeAfterSelecting?: boolean;
  }[];
  selectItem: (id: string) => any;
  selectedItem: string;
}

export interface IDrawerState {
  drawerOpen: boolean;
  animatedOpacity: Animated.Value;
  // drawerHeight: number;
  // animatedHeight: Animated.Value;
}

export class Drawer extends React.PureComponent<IDrawerProps, IDrawerState> {
  // DECLARATIONS =================================================================================

  // scrollViewRef = null;

  state: IDrawerState = {
    drawerOpen: false,
    animatedOpacity: new Animated.Value(0),
    // drawerHeight: 45,
    // animatedHeight: new Animated.Value(45),
  };
  mustClose = true;

  // RENDER =======================================================================================

  // getDrawerHeightAnimation = (wasFolderCreated?: boolean) => {
  //   const { folders } = this.props;
  //   const { animatedHeight, drawerOpen } = this.state;
  //   const menuItemHeight = 45;
  //   const mailboxesNumber = 4;
  //   const mailboxesHeight = menuItemHeight * mailboxesNumber;
  //   const foldersNumber = folders && folders.length;
  //   const foldersHeight = foldersNumber ? menuItemHeight * foldersNumber : 0;
  //   const createFolderContainerHeight = menuItemHeight;
  //   const selectDirectoryContainerHeight = menuItemHeight;
  //   const drawerMenuTotalHeight = selectDirectoryContainerHeight
  //     + mailboxesHeight
  //     + foldersHeight
  //     + createFolderContainerHeight
  //   const newHeightValue = drawerOpen && !wasFolderCreated ? menuItemHeight : drawerMenuTotalHeight;

  //   this.setState({ drawerHeight: newHeightValue });
  //   return Animated.timing(animatedHeight, {
  //     toValue: newHeightValue,
  //     ...ANIMATION_CONFIGURATIONS.size
  //   });
  // };

  getDrawerOpacityAnimation = () => {
    const { drawerOpen, animatedOpacity } = this.state;
    return Animated.timing(animatedOpacity, {
      toValue: drawerOpen ? 0 : 0.6,
      ...ANIMATION_CONFIGURATIONS.fade,
    });
  };

  // onDrawerToggle = (callback?: Function) => {
  //   const { drawerOpen } = this.state;
  //   const animations = [this.getDrawerHeightAnimation(), this.getDrawerOpacityAnimation()];
  //   callback && animations.pop();

  //   this.setState({ drawerOpen: true });
  //   Animated.parallel(animations).start(() => {
  //     // Note: setTimeout is used to smooth the animation
  //     this.setState({ drawerOpen: !drawerOpen });
  //     callback && setTimeout(() => callback(), 0);
  //     drawerOpen && this.scrollViewRef?.scrollTo({ y: 0, animated: false });
  //   });
  // };

  onDrawerToggle = () => {
    const { drawerOpen } = this.state;
    const animations = [this.getDrawerOpacityAnimation()];
    if (!this.mustClose) {
      this.mustClose = true;
      return;
    }
    this.setState({ drawerOpen: true });
    Animated.parallel(animations).start(() => {
      this.setState({ drawerOpen: !drawerOpen });
    });
  };

  render() {
    const { items, selectItem, selectedItem } = this.props;
    const { drawerOpen, animatedOpacity } = this.state;
    const formattedItems =
      items &&
      items.map(item => {
        const isItemSelected = selectedItem === item.value;
        const itemCount = item.count ? ` (${item.count})` : '';
        const itemLabel = `${item.name}${itemCount}`;
        const formattedItem: ItemType = {
          label: itemLabel,
          value: item.value,
          labelStyle: item.labelStyle || {},
        };
        if (item.iconName)
          formattedItem.icon = () => (
            <Icon size={25} name={item.iconName} color={isItemSelected ? theme.color.primary.regular : theme.color.text.heavy} />
          );
        if (isItemSelected) formattedItem.labelStyle = { ...formattedItem.labelStyle, color: theme.color.primary.regular };
        if (item.depth) formattedItem.containerStyle = { marginLeft: item.depth * 25 };
        return formattedItem;
      });

    return (
      <View style={styles.container}>
        <DropDownPicker
          open={drawerOpen}
          items={formattedItems}
          value={!drawerOpen && selectedItem}
          setOpen={() => this.onDrawerToggle()}
          setValue={callback => {
            const value = callback(selectedItem);
            const foundSelectedItem = items && items.find(item => item.value === value);
            this.mustClose = foundSelectedItem?.closeAfterSelecting ?? true;
            this.setState({ drawerOpen: !this.mustClose });
            setTimeout(() => selectItem(callback(selectedItem)), 0);
          }}
          placeholder={I18n.t('conversation.selectDirectory')}
          placeholderStyle={styles.placeholder}
          labelProps={{ numberOfLines: 1 }}
          itemLabelProps={{ numberOfLines: 1 }}
          textStyle={styles.text}
          labelStyle={styles.label}
          style={styles.style}
          dropDownContainerStyle={styles.dropDownContainer}
          listItemContainerStyle={styles.listItemContainer}
          maxHeight={LIST_MAX_HEIGHT}
          flatListProps={{
            showsVerticalScrollIndicator: false,
            alwaysBounceVertical: false,
          }}
          showTickIcon={false}
          arrowIconPosition="LEFT"
          arrowIconContainerStyle={styles.arrowContainer}
          ArrowUpIconComponent={() => (
            <Icon size={12} name="arrow_down" color={theme.color.primary.regular} style={styles.arrowUp} />
          )}
          ArrowDownIconComponent={() => <Icon size={12} name="arrow_down" color={theme.color.primary.regular} />}
        />
        <TouchableWithoutFeedback onPress={() => this.onDrawerToggle()}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: animatedOpacity,
                height: drawerOpen ? DROPDOWN_HEIGHT : 0,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  arrowContainer: {
    marginRight: 8,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  backdrop: {
    backgroundColor: '#000000',
    marginTop: ITEM_HEIGHT,
  },
  container: {
    position: 'absolute',
    width: '100%',
  },
  dropDownContainer: {
    borderRadius: LIST_RADIUS,
    borderWidth: undefined,
    paddingBottom: LIST_RADIUS,
  },
  label: {
    color: theme.color.primary.regular,
  },
  listItemContainer: {
    height: ITEM_HEIGHT,
    paddingLeft: 40,
  },
  placeholder: {
    color: theme.color.primary.regular,
    fontStyle: 'italic',
  },
  style: {
    borderBottomColor: theme.color.listItemBorder,
    borderBottomWidth: 1,
    borderRadius: undefined,
    borderWidth: undefined,
    height: ITEM_HEIGHT,
    position: 'absolute',
  },
  text: {
    fontWeight: Weight.Bold,
    overflow: 'hidden',
  },
});
