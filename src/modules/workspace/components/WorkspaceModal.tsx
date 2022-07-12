import I18n from 'i18n-js';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import ModalBox from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { IFile } from '~/modules/workspace/reducer';

import { WorkspaceFileListItem } from './WorkspaceFileListItem';

const styles = StyleSheet.create({
  titleText: {
    ...TextSizeStyle.SlightBig,
  },
  flatListContainer: {
    maxHeight: 400,
    marginVertical: UI_SIZES.spacing.small,
  },
  textInput: {
    marginVertical: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.minor,
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
    color: theme.ui.text.regular,
  },
});

export enum WorkspaceModalType {
  CREATE_FOLDER,
  DELETE,
  DOWNLOAD,
  DUPLICATE,
  EDIT,
  MOVE,
  NONE,
  TRASH,
}

interface IWorkspaceModalSettings {
  buttonText: string;
  title: string;
  hasDestinationSelector?: boolean;
  hasFileList?: boolean;
  hasInput?: boolean;
}

interface IWorkspaceModalProps {
  modalBoxRef: any;
  selectedFiles: IFile[];
  type: WorkspaceModalType;
}

const getModalSettings = (type: WorkspaceModalType): IWorkspaceModalSettings => {
  switch (type) {
    case WorkspaceModalType.CREATE_FOLDER:
      return { buttonText: I18n.t('create'), title: I18n.t('create-folder'), hasInput: true };
    case WorkspaceModalType.DELETE:
      return { buttonText: I18n.t('delete'), title: I18n.t('delete-confirm'), hasFileList: true };
    case WorkspaceModalType.DOWNLOAD:
      return { buttonText: I18n.t('download'), title: I18n.t('download-documents'), hasFileList: true };
    case WorkspaceModalType.DUPLICATE:
      return { buttonText: I18n.t('copy'), title: I18n.t('copy-documents'), hasDestinationSelector: true };
    case WorkspaceModalType.EDIT:
      return { buttonText: I18n.t('modify'), title: I18n.t('rename'), hasInput: true };
    case WorkspaceModalType.MOVE:
      return { buttonText: I18n.t('move'), title: I18n.t('move-documents'), hasDestinationSelector: true };
    case WorkspaceModalType.TRASH:
      return { buttonText: I18n.t('delete'), title: I18n.t('trash-confirm'), hasFileList: true };
    case WorkspaceModalType.NONE:
    default:
      return { buttonText: '', title: '' };
  }
};

export const WorkspaceModal = ({ modalBoxRef, selectedFiles, type }: IWorkspaceModalProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const settings = getModalSettings(type);
  return (
    <ModalBox
      ref={modalBoxRef}
      content={
        <View>
          <Text style={styles.titleText}>{settings.title}</Text>
          {settings.hasFileList ? (
            <FlatList
              data={selectedFiles}
              renderItem={({ item }) => <WorkspaceFileListItem item={item} disabled />}
              keyExtractor={(item: IFile) => item.id}
              style={styles.flatListContainer}
            />
          ) : null}
          {settings.hasInput ? (
            <TextInput value={inputValue} onChangeText={value => setInputValue(value)} style={styles.textInput} />
          ) : null}
          <ActionButton text={settings.buttonText} />
        </View>
      }
    />
  );
};
