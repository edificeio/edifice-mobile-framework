import { ColorValue } from 'react-native';

export interface RichEditorViewerProps {
  backgroundColor?: ColorValue;
  content: string;
  onLoad?: () => void;
}
