import 'react-native-video';

declare module 'react-native-video' {
  export interface VideoRef {
    toggleControls?: () => void;
    showControls?: () => void;
    hideControls?: () => void;
  }
}
