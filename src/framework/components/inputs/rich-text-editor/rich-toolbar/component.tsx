import React, { Component } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import theme, { defaultTheme } from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { RichToolbarActionItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/action/component';
import { RichToolbarCustomItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/custom/component';
import { RichToolbarMenuItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item/menu/component';
import { RichToolbarSeparator } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-separator';
import HorizontalList from '~/framework/components/list/horizontal';
import { SmallText } from '~/framework/components/text';

import styles from './styles';

export default class RichToolbar extends Component {
  constructor(props) {
    super(props);
    this.editor = null;
    this.state = {
      items: [],
      animatedValueEnter: new Animated.Value(0),
      animatedValueExit: new Animated.Value(0),
      animatedValueOpacityExit: new Animated.Value(0),
      animatedValueOpacityEnter: new Animated.Value(0),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const that = this;
    return (
      nextState.items !== that.state.items ||
      nextState.actions !== that.state.actions ||
      nextState.actions2 !== that.state.actions2 ||
      nextState.data !== that.state.data ||
      nextState.data2 !== that.state.data2 ||
      nextProps.style !== that.props.style
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { actions, actions2 } = nextProps;
    if (actions !== prevState.actions) {
      const { items = [] } = prevState;
      return {
        actions,
        data: actions.map(action => ({
          action,
          selected: items.includes(action),
        })),
        data2: actions2.map(action => ({
          action,
          selected: items.includes(action),
        })),
      };
    }
    return null;
  }

  componentDidMount() {
    setTimeout(this._mount);
  }

  _mount = () => {
    const { editor: { current: editor } = { current: this.props.getEditor?.() } } = this.props;
    if (!editor) {
      // No longer throw an error, just try to re-load it when needed.
      // This is because the webview may go away during long periods of inactivity,
      // and the ref will be lost, causing the entire app to crash in this throw new error.
      //throw new Error('Toolbar has no editor!');
      if (__DEV__) {
        console.warn('Toolbar has no editor. Please make sure the prop getEditor returns a ref to the editor component.');
      }
    } else {
      editor.registerToolbar(selectedItems => this.setSelectedItems(selectedItems));
      this.editor = editor;
    }
  };

  startAnimation = () => {
    Animated.timing(this.state.animatedValueExit, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.animatedValueEnter, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.animatedValueOpacityExit, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.animatedValueOpacityEnter, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  inverseAnimation = () => {
    Animated.timing(this.state.animatedValueExit, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.animatedValueEnter, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.animatedValueOpacityExit, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.animatedValueOpacityEnter, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  setSelectedItems(items) {
    const { items: selectedItems } = this.state;
    console.log(items, 'items', this.state.data, this.state.data2);
    if (this.editor && items !== selectedItems) {
      this.setState({
        items,
        data: this.state.actions.map(action => ({
          action,
          selected: items.includes(action),
        })),
        data2: this.state.actions2.map(action => ({
          action,
          selected: items.includes(action),
        })),
      });
    }
  }

  _defaultRenderAction(action, selected) {
    if (!this.editor) {
      this._mount();
      return;
    }
    if (action === 'separator') return <RichToolbarSeparator />;
    if (action === 'text-options') return <RichToolbarMenuItem icon={`ui-${action}`} onSelected={() => this.startAnimation()} />;
    if (action === 'image')
      return <RichToolbarCustomItem icon={`ui-${action}`} fill={defaultTheme.palette.complementary.green.regular} />;
    return <RichToolbarActionItem icon={`ui-${action}`} action={action} editor={this.editor} selected={selected} />;
  }

  render() {
    const { style, children } = this.props;
    const vStyle = [styles.barContainer, style];

    const interpolatedValueEnter = this.state.animatedValueEnter.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -41], // plage de valeurs pour la translation
    });

    const interpolatedValueOpacityEnter = this.state.animatedValueEnter.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1], // plage de valeurs pour la translation
    });

    const animatedStyleEnter = {
      flexDirection: 'row',
      transform: [{ translateY: interpolatedValueEnter }],
      opacity: interpolatedValueOpacityEnter,
    };

    const interpolatedValueExit = this.state.animatedValueExit.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 41], // plage de valeurs pour la translation
    });

    const interpolatedValueOpacityExit = this.state.animatedValueEnter.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0], // plage de valeurs pour la translation
    });

    const animatedStyleExit = {
      transform: [{ translateY: interpolatedValueExit }],
      opacity: interpolatedValueOpacityExit,
    };

    return (
      <View>
        <View style={vStyle}>
          <Animated.View style={animatedStyleExit}>
            <HorizontalList
              keyboardShouldPersistTaps="always"
              keyExtractor={(item, index) => item.action + '-' + index}
              data={this.state.data}
              alwaysBounceHorizontal={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => this._defaultRenderAction(item.action, item.selected)}
              ItemSeparatorComponent={() => <View style={{ width: UI_SIZES.spacing.tiny }} />} // add this line
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: UI_SIZES.spacing.medium }}
            />
          </Animated.View>
          <Animated.View style={animatedStyleEnter}>
            <TouchableOpacity onPress={() => this.inverseAnimation()}>
              <SmallText>close</SmallText>
            </TouchableOpacity>
            <HorizontalList
              keyboardShouldPersistTaps="always"
              keyExtractor={(item, index) => item.action + '-' + index}
              data={this.state.data2}
              alwaysBounceHorizontal={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => this._defaultRenderAction(item.action, item.selected)}
              ItemSeparatorComponent={() => <View style={{ width: UI_SIZES.spacing.tiny }} />} // add this line
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: UI_SIZES.spacing.medium }}
            />
          </Animated.View>

          {children}
        </View>
        <View style={{ height: this.props.heightPageToolbar, backgroundColor: theme.palette.grey.white }}>
          {/* <RichToolbarPage
            title="Titre de la page"
            content={
              <View></View>
            }
          /> */}
        </View>
      </View>
    );
  }
}
