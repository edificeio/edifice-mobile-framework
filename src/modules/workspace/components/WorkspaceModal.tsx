import I18n from 'i18n-js';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import ModalBox from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';
import { Filter, IFile, IFolder } from '~/modules/workspace/reducer';

import { WorkspaceFileListItem } from './WorkspaceFileListItem';
import { WorkspaceFolderSelector } from './WorkspaceFolderSelector';

const styles = StyleSheet.create({
  flatListContainer: {
    maxHeight: 400,
    marginVertical: UI_SIZES.spacing.small,
  },
  textInput: {
    marginVertical: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.fog,
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

export interface IWorkspaceModalEventProps {
  createFolder: (name: string, parentId: string) => void;
  deleteFiles: (parentId: string, files: IFile[]) => void;
  downloadFiles: (files: IFile[]) => void;
  duplicateFiles: (parentId: string, files: IFile[], destinationId: string) => void;
  moveFiles: (parentId: string, files: IFile[], destinationId: string) => void;
  renameFile: (file: IFile, name: string) => void;
  trashFiles: (parentId: string, files: IFile[]) => void;
}

interface IWorkspaceModalProps {
  filter: Filter;
  folderTree: IFolder[];
  modalBoxRef: any;
  parentId: string;
  selectedFiles: IFile[];
  type: WorkspaceModalType;
  onAction: (files: IFile[], value: string, destinationId: string) => void;
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

export const WorkspaceModal = ({
  filter,
  folderTree,
  modalBoxRef,
  parentId,
  selectedFiles,
  type,
  onAction,
}: IWorkspaceModalProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fileExtension, setFileExtension] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const settings = getModalSettings(type);
  const isDisabled =
    (settings.hasInput && inputValue === '') ||
    (type === WorkspaceModalType.MOVE && filter === Filter.OWNER && destination === parentId);
  const action = () => onAction(selectedFiles, inputValue + fileExtension, destination);

  useEffect(() => {
    if (type === WorkspaceModalType.EDIT && selectedFiles.length) {
      const name = selectedFiles[0].name;
      const index = name.lastIndexOf('.');
      setInputValue(index > 0 ? name.substring(0, index) : name);
      setFileExtension(index > 0 ? name.substring(index) : '');
    } else if (type === WorkspaceModalType.CREATE_FOLDER) {
      setInputValue('');
      setFileExtension('');
    } else if (settings.hasDestinationSelector) {
      setDestination(parentId);
    }
  }, [parentId, selectedFiles, settings.hasDestinationSelector, type]);

  return (
    <ModalBox
      ref={modalBoxRef}
      content={
        <View>
          <BodyText>{settings.title}</BodyText>
          {settings.hasDestinationSelector ? (
            <WorkspaceFolderSelector
              data={folderTree}
              defaultValue={filter === Filter.OWNER ? parentId : 'owner'}
              excludeData={selectedFiles}
              onChangeValue={value => setDestination(value)}
            />
          ) : null}
          {settings.hasFileList ? (
            <FlatList
              data={selectedFiles}
              renderItem={({ item }) => <WorkspaceFileListItem item={item} isDisabled />}
              keyExtractor={(item: IFile) => item.id}
              style={styles.flatListContainer}
            />
          ) : null}
          {settings.hasInput ? (
            <TextInput
              value={inputValue}
              onChangeText={value => setInputValue(value)}
              autoFocus={type === WorkspaceModalType.CREATE_FOLDER}
              style={styles.textInput}
            />
          ) : null}
          <ActionButton text={settings.buttonText} action={action} disabled={isDisabled} />
        </View>
      }
    />
  );
};
