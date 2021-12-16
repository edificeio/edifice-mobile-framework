import I18n from 'i18n-js';
import * as React from 'react';
import { Animated, StyleSheet, TextStyle, TouchableWithoutFeedback, View } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES, UI_VALUES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { Weight } from '~/ui/Typography';

const ITEM_HEIGHT = 45;
const LIST_RADIUS = 20;

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
  isNavbar: boolean;
  isTabbar: boolean;
  selectItem: (id: string) => any;
  selectedItem: string;
}

export interface IDrawerState {
  backdropHeight: number;
  backdropOpacity: Animated.Value;
  drawerOpen: boolean;
}

export class Drawer extends React.PureComponent<IDrawerProps, IDrawerState> {
  state: IDrawerState = {
    backdropHeight: 0,
    backdropOpacity: new Animated.Value(0),
    drawerOpen: false,
  };

  static defaultProps = {
    isNavbar: true,
    isTabbar: true,
  };

  closeAfterSelecting = true;
  backdropMaxHeight = 0;
  listMaxHeight = 0;
  selectedValue = null;

  constructor(props) {
    super(props);
    const { isNavbar, isTabbar } = this.props;
    this.backdropMaxHeight = UI_SIZES.getViewHeight({ isNavbar, isTabbar });
    this.listMaxHeight = this.backdropMaxHeight - ITEM_HEIGHT + LIST_RADIUS - 2 * UI_SIZES.tabsHeight;
  }

  getBackDropOpacityAnimation = (willOpen: boolean) => {
    const { backdropOpacity } = this.state;
    return Animated.timing(backdropOpacity, {
      toValue: willOpen ? UI_VALUES.modalOpacity : 0,
      ...UI_ANIMATIONS.fade,
    });
  };

  toggle = (drawerOpen: boolean) => {
    const { selectItem } = this.props;
    if (this.closeAfterSelecting) {
      const willOpen = !drawerOpen;
      if (willOpen) this.setState({ backdropHeight: this.backdropMaxHeight, drawerOpen: true });
      else this.setState({ drawerOpen: false });
      this.getBackDropOpacityAnimation(willOpen).start(() => {
        if (!willOpen) this.setState({ backdropHeight: 0 });
      });
    }
    if (this.selectedValue) {
      selectItem(this.selectedValue);
      this.selectedValue = null;
    }
  };

  render() {
    const { items, selectedItem } = this.props;
    const { backdropHeight, backdropOpacity, drawerOpen } = this.state;
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
        const color = isItemSelected ? theme.color.primary.regular : theme.color.text.regular;
        formattedItem.labelStyle = { ...formattedItem.labelStyle, color };
        if (item.iconName) formattedItem.icon = () => <Icon size={25} name={item.iconName} color={color} />;
        if (item.depth) formattedItem.containerStyle = { marginLeft: item.depth * 25 };
        return formattedItem;
      });

    // Add bottom margin on last item
    formattedItems.slice(-1)[0].containerStyle = { marginBottom: LIST_RADIUS / 2 };

    return (
      <View style={styles.container}>
        <DropDownPicker
          open={drawerOpen}
          items={formattedItems}
          value={!drawerOpen && selectedItem}
          setOpen={() => this.toggle(drawerOpen)}
          setValue={callback => {
            this.selectedValue = callback(selectedItem);
            const foundSelectedItem = items && items.find(item => item.value === this.selectedValue);
            this.closeAfterSelecting = foundSelectedItem?.closeAfterSelecting ?? true;
            this.setState({ drawerOpen: !this.closeAfterSelecting });
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
          maxHeight={this.listMaxHeight}
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
        <TouchableWithoutFeedback onPress={() => this.toggle(drawerOpen)}>
          <Animated.View style={[styles.backdrop, { height: backdropHeight, opacity: backdropOpacity }]} />
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
