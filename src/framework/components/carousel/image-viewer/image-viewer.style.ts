import { TextStyle, ViewStyle } from 'react-native';

export default (
  width: number,
  height: number,
  backgroundColor: string
): {
  [x: string]: ViewStyle | TextStyle;
} => {
  return {
    container: { backgroundColor },
    imageStyle: {},
    menuContainer: { bottom: 0, height, left: 0, position: 'absolute', width, zIndex: 12 },
    loadingTouchable: { height, width },
    menuContent: { left: 0, bottom: 0, position: 'absolute', width, zIndex: 11 },
    menuShadow: {
      height,
      backgroundColor: 'black',
      position: 'absolute',
      bottom: 0,
      width,
      left: 0,
      opacity: 0.2,
      zIndex: 10,
    },
    modalContainer: { alignItems: 'center', backgroundColor, justifyContent: 'center', overflow: 'hidden' },

    arrowLeftContainer: { bottom: 0, justifyContent: 'center', position: 'absolute', left: 0, top: 0, zIndex: 13 },

    watchOrigin: { bottom: 20, alignItems: 'center', position: 'absolute', justifyContent: 'center', width },

    arrowRightContainer: { bottom: 0, justifyContent: 'center', position: 'absolute', right: 0, top: 0, zIndex: 13 },

    watchOriginText: { backgroundColor: 'transparent', color: 'white' },

    loadingContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },

    watchOriginTouchable: {
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 5,
      paddingBottom: 5,
      borderRadius: 30,
      borderColor: 'white',
      borderWidth: 0.5,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
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
