import { TextStyle, ViewStyle } from 'react-native';

export default (
  width: number,
  height: number,
  backgroundColor: string
): {
  [x: string]: ViewStyle | TextStyle;
} => {
  return {
    arrowLeftContainer: { bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', top: 0, zIndex: 13 },
    arrowRightContainer: { bottom: 0, justifyContent: 'center', position: 'absolute', right: 0, top: 0, zIndex: 13 },
    container: { backgroundColor },
    imageStyle: {},
    loadingContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    loadingTouchable: { height, width },
    menuContainer: { bottom: 0, height, left: 0, position: 'absolute', width, zIndex: 12 },

    menuContent: { bottom: 0, left: 0, position: 'absolute', width, zIndex: 11 },

    menuShadow: {
      backgroundColor: 'black',
      bottom: 0,
      height,
      left: 0,
      opacity: 0.2,
      position: 'absolute',
      width,
      zIndex: 10,
    },

    modalContainer: { alignItems: 'center', backgroundColor, justifyContent: 'center', overflow: 'hidden' },

    // 多图浏览需要调整整体位置的盒子
    moveBox: { alignItems: 'center', flexDirection: 'row' },

    operateContainer: {
      alignItems: 'center',
      backgroundColor: 'white',
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
      height: 40,
      justifyContent: 'center',
    },

    operateText: { color: '#333' },

    watchOrigin: { alignItems: 'center', bottom: 20, justifyContent: 'center', position: 'absolute', width },
    watchOriginText: { backgroundColor: 'transparent', color: 'white' },
    watchOriginTouchable: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderColor: 'white',
      borderRadius: 30,
      paddingBottom: 5,
      borderWidth: 0.5,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 5,
    },
  };
};

export const simpleStyle: {
  [x: string]: ViewStyle | TextStyle;
} = {
  count: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 38,
    zIndex: 13,
  },
  countText: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      height: 0.5,
      width: 0,
    },
    textShadowRadius: 0,
  },
};
