import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import HorizontalList from '~/framework/components/list/horizontal';

import { actions } from './const';
import { RichToolbarIconButton } from './rich-toolbar-icon-button';
import { RichToolbarItem } from './rich-toolbar-item';
import { RichToolbarPage } from './rich-toolbar-page';
import { RichToolbarTextButton } from './rich-toolbar-text-button';

const styles = StyleSheet.create({
  barContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
});

export const defaultActions = [
  actions.keyboard,
  actions.setBold,
  actions.setItalic,
  actions.setUnderline,
  actions.removeFormat,
  actions.insertBulletsList,
  actions.indent,
  actions.outdent,
  actions.insertLink,
];

// noinspection FallThroughInSwitchStatementJS
export default class RichToolbar extends Component {
  static defaultProps = {
    actions: defaultActions,
    disabled: false,
    iconTint: '#71787F',
    iconSize: 20,
    iconGap: 16,
  };

  constructor(props) {
    super(props);
    this.editor = null;
    this.state = {
      items: [],
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const that = this;
    return (
      nextState.items !== that.state.items ||
      nextState.actions !== that.state.actions ||
      nextState.data !== that.state.data ||
      nextProps.style !== that.props.style
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { actions } = nextProps;
    if (actions !== prevState.actions) {
      const { items = [] } = prevState;
      return {
        actions,
        data: actions.map(action => ({ action, selected: items.includes(action) })),
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

  setSelectedItems(items) {
    const { items: selectedItems } = this.state;
    if (this.editor && items !== selectedItems) {
      this.setState({
        items,
        data: this.state.actions.map(action => ({ action, selected: items.includes(action) })),
      });
    }
  }

  _getButtonDisabledStyle() {
    return this.props.disabledButtonStyle && this.props.disabledButtonStyle;
  }

  _onPress(action) {
    const { onPressAddImage, onInsertLink, insertVideo } = this.props;
    const editor = this.editor;

    if (this.props.onSelectItem) this.props.onSelectItem();

    if (!editor) {
      this._mount();
      return;
    }

    switch (action) {
      case actions.insertLink:
        if (onInsertLink) return onInsertLink();
      case actions.setBold:
      case actions.setItalic:
      case actions.undo:
      case actions.redo:
      case actions.insertBulletsList:
      case actions.insertOrderedList:
      case actions.checkboxList:
      case actions.setUnderline:
      case actions.heading1:
      case actions.heading2:
      case actions.heading3:
      case actions.heading4:
      case actions.heading5:
      case actions.heading6:
      case actions.code:
      case actions.blockquote:
      case actions.line:
      case actions.setParagraph:
      case actions.removeFormat:
      case actions.alignLeft:
      case actions.alignCenter:
      case actions.alignRight:
      case actions.alignFull:
      case actions.setSubscript:
      case actions.setSuperscript:
      case actions.setStrikethrough:
      case actions.setHR:
      case actions.indent:
      case actions.outdent:
        editor.showAndroidKeyboard();
        editor.sendAction(action, 'result');
        break;
      case actions.insertImage:
        onPressAddImage?.();
        break;
      case actions.insertVideo:
        insertVideo?.();
        break;
      default:
        this.props[action]?.();
        break;
    }
  }

  _defaultRenderAction(action, selected) {
    const that = this;
    return <RichToolbarItem icon={`ui-${action}`} onSelected={() => that._onPress(action)} selected={selected} />;
  }

  _renderAction(action, selected) {
    return this.props.renderAction ? this.props.renderAction(action, selected) : this._defaultRenderAction(action, selected);
  }

  render() {
    const { style, disabled, children } = this.props;
    const vStyle = [styles.barContainer, style, disabled && this._getButtonDisabledStyle()];
    return (
      <View>
        <View style={vStyle}>
          <HorizontalList
            keyboardShouldPersistTaps="always"
            keyExtractor={(item, index) => item.action + '-' + index}
            data={this.state.data}
            alwaysBounceHorizontal={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => this._renderAction(item.action, item.selected)}
            ItemSeparatorComponent={() => <View style={{ width: UI_SIZES.spacing.tiny }} />} // add this line
            contentContainerStyle={{ alignItems: 'center' }}
          />
          {children}
        </View>
        <View style={{ height: this.props.heightPageToolbar, backgroundColor: theme.palette.grey.white }}>
          <RichToolbarPage
            title="Style de texte"
            content={
              <View>
                <RichToolbarIconButton icon="ui-mail" selected />
                <RichToolbarTextButton text="Titre 1" selected />
              </View>
            }
          />
        </View>
      </View>
    );
  }
}
