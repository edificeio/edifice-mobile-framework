import I18n from 'i18n-js';
import * as React from 'react';
import { Animated, StyleSheet, TextStyle, TouchableWithoutFeedback, View } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES, UI_VALUES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';

import { TextFontStyle, TextSizeStyle } from './text';

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

const styles = StyleSheet.create({
  arrowContainer: {
    marginRight: UI_SIZES.spacing.minor,
  },
  arrowUp: {
    transform: [{ rotate: '180deg' }],
  },
  backdrop: {
    backgroundColor: theme.ui.shadowColor,
    marginTop: ITEM_HEIGHT,
    zIndex: -1,
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
    color: theme.palette.secondary.regular,
  },
  listItemContainer: {
    height: ITEM_HEIGHT,
    paddingLeft: UI_SIZES.spacing.large + UI_SIZES.spacing.tiny, // A little random here but it looks cool
  },
  placeholder: {
    ...TextFontStyle.Italic,
    ...TextSizeStyle.Normal,
    color: theme.palette.secondary.regular,
  },
  style: {
    borderBottomColor: theme.ui.border.listItem,
    borderBottomWidth: 1,
    borderRadius: undefined,
    borderWidth: undefined,
    height: ITEM_HEIGHT,
    position: 'absolute',
  },
  text: {
    ...TextFontStyle.Bold,
    overflow: 'hidden',
  },
});

export class Drawer extends React.PureComponent<IDrawerProps, IDrawerState> {
  // Initial state
  state: IDrawerState = {
    backdropHeight: 0,
    backdropOpacity: new Animated.Value(0),
    drawerOpen: false,
  };

  // Default propss
  static defaultProps = {
    isNavbar: true,
    isTabbar: true,
  };

  // Close dropdown list after item selection?
  private closeAfterSelecting = true;

  // Backdrop maximum heightt
  private backdropMaxHeight = 0;

  // Dropdown List maximum heigh
  private listMaxHeight = 0;

  // Selected value if any
  private selectedValue = null;

  constructor(props) {
    super(props);
    const { isNavbar, isTabbar } = this.props;
    // Calculate backdrop max height depending on UI elements
    this.backdropMaxHeight = UI_SIZES.getViewHeight({ isNavbar, isTabbar });
    // Calculate dropdown list max height
    this.listMaxHeight = this.backdropMaxHeight - ITEM_HEIGHT + LIST_RADIUS - 2 * UI_SIZES.elements.tabbarHeight;
  }

  // Return backdrop animation depending on future state (Open||Close)
  getBackDropOpacityAnimation = (willOpen: boolean) => {
    const { backdropOpacity } = this.state;
    return Animated.timing(backdropOpacity, {
      toValue: willOpen ? UI_VALUES.opacity.modal : UI_VALUES.opacity.transparent,
      ...UI_ANIMATIONS.fade,
    });
  };

  // Close dropdown list
  close() {
    // Close dropdown list first
    this.setState({ drawerOpen: false });
    // Then animate backdrop opacity (dropdown list animation is done by react-native-dropdown-picker)
    this.getBackDropOpacityAnimation(false).start(() => {
      // Finally strech backdrop
      this.setState({ backdropHeight: 0 });
    });
  }

  // Open dropdown list
  open() {
    // Expand dropdown list to its max height && open dropdoxwn list first
    this.setState({ backdropHeight: this.backdropMaxHeight, drawerOpen: true });
    // Then animate backdrop opacity (dropdown list animation is done by react-native-dropdown-picker)
    this.getBackDropOpacityAnimation(true).start();
  }

  // Toggle dropdown list depending on acttual state (Open||Close)
  toggle = (drawerOpen: boolean) => {
    // Close||Open dropdown list if needed
    if (this.closeAfterSelecting) (drawerOpen && this.close()) || (!drawerOpen && this.open());
    // Reset flag
    this.closeAfterSelecting = true;
    // Callback parent if an ittem has been selected
    if (this.selectedValue) {
      const { selectItem } = this.props;
      selectItem(this.selectedValue);
      this.selectedValue = null;
    }
  };

  render() {
    const { items, selectedItem } = this.props;
    const { backdropHeight, backdropOpacity, drawerOpen } = this.state;

    // Construct react-native-dropdown-picker compatible items list
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
        const color = isItemSelected ? theme.palette.secondary.regular : theme.ui.text.regular;
        formattedItem.labelStyle = { ...formattedItem.labelStyle, color };
        if (item.iconName)
          formattedItem.icon = () => <Icon size={UI_SIZES.dimensions.width.larger} name={item.iconName} color={color} />;
        if (item.depth) formattedItem.containerStyle = { marginLeft: item.depth * UI_SIZES.dimensions.width.larger };
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
            // Memoize selected value (will be used by toggle())
            this.selectedValue = callback(selectedItem);
            // Determine if dropdown list must be closed after selecting this item (depends on item prop)
            const foundSelectedItem = items && items.find(item => item.value === this.selectedValue);
            this.closeAfterSelecting = foundSelectedItem?.closeAfterSelecting ?? true;
            // Update state => toggle will be called
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
            <Icon size={12} name="arrow_down" color={theme.palette.secondary.regular} style={styles.arrowUp} />
          )}
          ArrowDownIconComponent={() => <Icon size={12} name="arrow_down" color={theme.palette.secondary.regular} />}
        />
        <TouchableWithoutFeedback onPress={() => this.toggle(drawerOpen)}>
          <Animated.View style={[styles.backdrop, { height: backdropHeight, opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
