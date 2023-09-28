import React, { Component, createRef } from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { actions } from '~/framework/components/inputs/rich-text-editor/const';
import { RichToolbarItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-item';
import { RichToolbarPage } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-page';
import FlatList from '~/framework/components/list/flat-list';
import HorizontalList from '~/framework/components/list/horizontal';
import { SmallBoldText } from '~/framework/components/text';

import { RichToolbarNavigationButton } from '../rich-toolbar-navigation-button';
import styles from './styles';

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

// const RichToolbar = props => {
//   const [items, setItems] = useState([]);
//   const [pages, setPages] = useState([<RichToolbarPage title="Style de texte" content={<View>{/* Vos boutons ici */}</View>} />]);

//   const listRef = useRef(null);
//   let editor = props.editor;

//   const setSelectedItems = items => {
//     if (props.onSelectAction) props.onSelectAction(action);

//     if (!editor) {
//       mount();
//     }
//   };

//   const mount = () => {
//     const { editor: { current: editor } = { current: props.getEditor?.() } } = props;
//     if (!editor) {
//       if (__DEV__) {
//         console.warn('Toolbar has no editor. Please make sure the prop getEditor returns a ref to the editor component.');
//       }
//     } else {
//       editor.registerToolbar(selectedItems => setSelectedItems(selectedItems));
//       editor = editor;
//     }
//   };

//   useEffect(() => {
//     setTimeout(mount);
//   }, []);
// };

// noinspection FallThroughInSwitchStatementJS
export default class RichToolbar extends Component {
  constructor(props) {
    super(props);
    this.editor = null;
    this.state = {
      items: [],
      pages: [
        <RichToolbarPage
          title="Style de texte"
          content={
            <View>
              {/* <RichToolbarIconButton
              icon="ui-bold"
              action={() => this.props.onSelectAction(actions.setBold)}
              selected={this.props.memoActionsSelected.includes(actions.setBold)}
            />
            <RichToolbarIconButton
              icon="ui-italic"
              action={() => this.props.onSelectAction(actions.setItalic)}
              selected={this.props.memoActionsSelected.includes(actions.setItalic)}
            />
            <RichToolbarTextButton text="Titre 1" selected /> */}
              <RichToolbarNavigationButton
                title="Taille de texte"
                action={() => {
                  this.setPage();
                  //this.listRef.current.scrollToIndex({ index: 1 });
                }}
              />
              <RichToolbarNavigationButton
                title="Couleur du texte"
                action={() => this.listRef.current.scrollToIndex({ index: 2 })}
              />
            </View>
          }
        />,
        <RichToolbarPage
          title="Taille du texte"
          index={1}
          handleBack={() => this.listRef.current.scrollToIndex({ index: 0 })}
          content={
            <View>
              <SmallBoldText>TEST 1</SmallBoldText>
            </View>
          }
        />,
        <RichToolbarPage
          title="Couleur du texte"
          index={2}
          handleBack={() => this.listRef.current.scrollToIndex({ index: 0 })}
          content={
            <View>
              <SmallBoldText>TEST 2</SmallBoldText>
            </View>
          }
        />,
      ],
    };
  }

  listRef = createRef();

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
    console.log('test');
    const { actions } = nextProps;
    if (actions !== prevState.actions) {
      const { items = [] } = prevState;
      return {
        actions,
        data: actions.map(action => ({
          action,
          selected: items.includes(action) || nextProps.memoActionsSelected.includes(action),
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

  setSelectedItems(items) {
    const { items: selectedItems } = this.state;
    if (this.editor && items !== selectedItems) {
      this.setState({
        items,
        data: this.state.actions.map(action => ({
          action,
          selected: items.includes(action) || this.props.memoActionsSelected.includes(action),
        })),
      });
    }
  }

  _onPress(action) {
    const { onPressAddImage, onInsertLink, insertVideo } = this.props;
    const editor = this.editor;

    console.log(this.listRef, 'ref');

    if (this.props.onSelectAction) this.props.onSelectAction(action);

    if (!editor) {
      this._mount();
    }

    // switch (action) {
    //   case actions.insertLink:
    //     if (onInsertLink) return onInsertLink();
    //   case actions.setBold:
    //   case actions.setItalic:
    //   case actions.undo:
    //   case actions.redo:
    //   case actions.insertBulletsList:
    //   case actions.insertOrderedList:
    //   case actions.checkboxList:
    //   case actions.setUnderline:
    //   case actions.heading1:
    //   case actions.heading2:
    //   case actions.heading3:
    //   case actions.heading4:
    //   case actions.heading5:
    //   case actions.heading6:
    //   case actions.code:
    //   case actions.blockquote:
    //   case actions.line:
    //   case actions.setParagraph:
    //   case actions.removeFormat:
    //   case actions.alignLeft:
    //   case actions.alignCenter:
    //   case actions.alignRight:
    //   case actions.alignFull:
    //   case actions.setSubscript:
    //   case actions.setSuperscript:
    //   case actions.setStrikethrough:
    //   case actions.setHR:
    //   case actions.indent:
    //   case actions.outdent:
    //     editor.showAndroidKeyboard();
    //     editor.sendAction(action, 'result');
    //     break;
    //   case actions.insertImage:
    //     onPressAddImage?.();
    //     break;
    //   case actions.insertVideo:
    //     insertVideo?.();
    //     break;
    //   default:
    //     this.props[action]?.();
    //     break;
    // }
  }

  defaultRenderAction(action, selected) {
    const that = this;
    return <RichToolbarItem icon={`ui-${action}`} onSelected={() => that._onPress(action)} selected={selected} />;
  }

  renderAction(action, selected) {
    return this.props.renderAction ? this.props.renderAction(action, selected) : this._defaultRenderAction(action, selected);
  }

  render() {
    const { style, children } = this.props;
    const vStyle = [styles.barContainer, style];
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
          <FlatList
            horizontal
            ref={this.listRef}
            keyboardShouldPersistTaps="always"
            keyExtractor={(item, index) => 'pages-' + index}
            data={this.state.pages}
            alwaysBounceHorizontal={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => item}
            scrollEnabled={false}
            pagingEnabled
          />
        </View>
      </View>
    );
  }
}
