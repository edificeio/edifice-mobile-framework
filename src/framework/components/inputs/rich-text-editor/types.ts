import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export enum RichTextEditorMode {
  PREVIEW = 'PREVIEW',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

interface RichTextEditorScreenDataProps {}

interface RichTextEditorScreenEventProps {}

export interface RichTextEditorScreenNavParams {
  content: string | null;
  mode: RichTextEditorMode;
}

export type RichTextEditorScreenProps = RichTextEditorScreenDataProps &
  RichTextEditorScreenEventProps &
  NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.RichTextEditor>;
