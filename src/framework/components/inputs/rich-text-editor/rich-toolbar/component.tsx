import React, { Component } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { UI_SIZES } from '~/framework/components/constants';
import { actions } from '~/framework/components/inputs/rich-text-editor/const';
import { RichToolbarActionItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar/rich-toolbar-item/action/component';
import { RichToolbarCustomItem } from '~/framework/components/inputs/rich-text-editor/rich-toolbar/rich-toolbar-item/custom/component';
import { RichToolbarItemsList } from '~/framework/components/inputs/rich-text-editor/rich-toolbar/rich-toolbar-items-list';
import { RichToolbarSeparator } from '~/framework/components/inputs/rich-text-editor/rich-toolbar/rich-toolbar-separator';
import { NamedSVG } from '~/framework/components/picture';

import styles from './styles';

// const showAnimation = (ref, to) => {
//   Animated.timing(ref, {
//     toValue: to,
//     duration: 200,
//     useNativeDriver: false,
//   }).start();
// };

// const RichToolbar = (props: RichToolbarProps) => {
//   const [items, setItems] = useState([]);

//   const animatedValueEnterTranslate = useRef(new Animated.Value(0)).current;
//   const animatedValueExitTranslate = useRef(new Animated.Value(0)).current;
//   const animatedValueEnterOpacity = useRef(new Animated.Value(0)).current;
//   const animatedValueExitOpacity = useRef(new Animated.Value(0)).current;
//   const editor = null;

//   const startAnimation = () => {
//     showAnimation(animatedValueEnterTranslate, -41);
//     showAnimation(animatedValueExitTranslate, 41);
//     showAnimation(animatedValueEnterOpacity, 1);
//     showAnimation(animatedValueExitOpacity, 0);
//   };

//   const inverseAnimation = () => {
//     showAnimation(animatedValueEnterTranslate, 0);
//     showAnimation(animatedValueExitTranslate, 0);
//     showAnimation(animatedValueEnterOpacity, 0);
//     showAnimation(animatedValueExitOpacity, 1);
//   };

//   useEffect(() => {
//     console.log('test', props.getEditor?.());
//   }, []);

//   return (
//     <View>
//       <View style={styles.barContainer}>
//         <Animated.View style={{ transform: [{ translateY: animatedValueExitTranslate }], opacity: animatedValueExitOpacity }}>
//           <RichToolbarItemsList
//             list={[
//               <RichToolbarCustomItem icon="ui-image" fill={theme.palette.complementary.green.regular} />,
//               <RichToolbarSeparator />,
//               <RichToolbarMenuItem icon="ui-text-options" onSelected={startAnimation} />,
//             ]}
//           />
//         </Animated.View>
//         <Animated.View
//           style={{
//             flexDirection: 'row',
//             transform: [{ translateY: animatedValueEnterTranslate }],
//             opacity: animatedValueEnterOpacity,
//           }}>
//           <TouchableOpacity onPress={inverseAnimation}>
//             <SmallText>close</SmallText>
//           </TouchableOpacity>
//           <RichToolbarItemsList
//             list={[
//               <RichToolbarActionItem
//                 icon={`ui-${actions.setBold}`}
//                 action={actions.setBold}
//                 editor={editor}
//                 selected={items.includes(actions.setBold)}
//               />,
//               <RichToolbarActionItem icon={`ui-${actions.setItalic}`} action={actions.setItalic} editor={editor} />,
//               <RichToolbarActionItem icon={`ui-${actions.setUnderline}`} action={actions.setUnderline} editor={editor} />,
//               <RichToolbarActionItem icon={`ui-${actions.insertBulletsList}`} action={actions.insertBulletsList} editor={editor} />,
//               <RichToolbarActionItem icon={`ui-${actions.insertOrderedList}`} action={actions.insertOrderedList} editor={editor} />,
//               <RichToolbarActionItem icon={`ui-${actions.setSubscript}`} action={actions.setSubscript} editor={editor} />,
//               <RichToolbarActionItem icon={`ui-${actions.setSuperscript}`} action={actions.setSuperscript} editor={editor} />,
//             ]}
//           />
//         </Animated.View>
//       </View>
//       <View style={{ height: props.heightPageToolbar, backgroundColor: theme.palette.grey.white }}>
//         {/* <RichToolbarPage
//             title="Titre de la page"
//             content={
//               <View></View>
//             }
//           /> */}
//       </View>
//     </View>
//   );
// };

// export default RichToolbar;

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
    this.setState({ items });
  }

  render() {
    const { style } = this.props;

    const interpolatedValueEnter = this.state.animatedValueEnter.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -45], // plage de valeurs pour la translation
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
      outputRange: [0, 45], // plage de valeurs pour la translation
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
        <View style={style}>
          <Animated.View style={animatedStyleExit}>
            <RichToolbarItemsList
              list={[
                <RichToolbarCustomItem
                  icon="ui-image"
                  fill={theme.palette.complementary.green.regular}
                  action={() => console.log('show bottomsheet add image')}
                />,
                <RichToolbarSeparator />,
                <RichToolbarCustomItem icon="ui-text-options" action={this.startAnimation} />,
              ]}
            />
          </Animated.View>
          <Animated.View style={animatedStyleEnter}>
            <TouchableOpacity style={styles.closeUnderMenu} onPress={() => this.inverseAnimation()}>
              <IconButton
                icon="ui-close"
                size={UI_SIZES.elements.icon.xxsmall}
                color={theme.palette.grey.white}
                style={styles.closeUnderMenuCross}
              />
              <NamedSVG
                fill={theme.palette.grey.black}
                name="ui-text-options"
                width={UI_SIZES.elements.icon.small}
                height={UI_SIZES.elements.icon.small}
              />
            </TouchableOpacity>
            <RichToolbarItemsList
              list={[
                <RichToolbarActionItem
                  icon={`ui-${actions.setBold}`}
                  action={actions.setBold}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.setBold)}
                />,
                <RichToolbarActionItem
                  icon={`ui-${actions.setItalic}`}
                  action={actions.setItalic}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.setItalic)}
                />,
                <RichToolbarActionItem
                  icon={`ui-${actions.setUnderline}`}
                  action={actions.setUnderline}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.setUnderline)}
                />,
                <RichToolbarActionItem
                  icon={`ui-${actions.insertBulletsList}`}
                  action={actions.insertBulletsList}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.insertBulletsList)}
                />,
                <RichToolbarActionItem
                  icon={`ui-${actions.insertOrderedList}`}
                  action={actions.insertOrderedList}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.insertOrderedList)}
                />,
                <RichToolbarActionItem
                  icon={`ui-${actions.setSubscript}`}
                  action={actions.setSubscript}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.setSubscript)}
                />,
                <RichToolbarActionItem
                  icon={`ui-${actions.setSuperscript}`}
                  action={actions.setSuperscript}
                  editor={this.editor}
                  selected={this.state.items.includes(actions.setSuperscript)}
                />,
              ]}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
}
