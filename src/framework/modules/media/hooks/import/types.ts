import * as React from 'react';
import { ColorValue } from 'react-native';

import { LocalFile } from '~/framework/util/fileHandler';
import { IMedia } from '~/framework/util/media';
import { ArrayElement } from '~/utils/types';

export interface MediaImportImperativeAPI {
  element: React.ElementType;
  import: () => void;
}
export interface MediaBottomSheetModalInternalData<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}
export type LocalMediaImportResult = LocalFile[];
export interface MediaImportChoiceOption {
  onPress: () => Promise<LocalMediaImportResult>;
  i18n: string;
  icon: string;
}
export type MediaImportChoices = {
  options: MediaImportChoiceOption[];
  element?: React.ReactNode;
  title: { color: ColorValue; i18n: string; icon: string };
};
export type MediaImportChoicesHook = () => MediaImportChoices;
export type MediaTypeList = IMedia['type'][];
export type MediaImportChoicesHookByType = Record<ArrayElement<MediaTypeList>, MediaImportChoicesHook>;
export type PartialMediaImportChoicesHookByType = Partial<
  Record<ArrayElement<MediaTypeList>, () => Omit<MediaImportChoices, 'title'> & Pick<Partial<MediaImportChoices>, 'title'>>
>;
export type MediaImportChoicesByType = Record<ArrayElement<MediaTypeList>, MediaImportChoices>;
