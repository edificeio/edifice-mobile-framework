import I18n from 'i18n-js';
import * as React from 'react';

import { Trackers } from '~/framework/util/tracker';
import { FilePicker } from '~/infra/filePicker';
import { createFolderAction } from '~/modules/workspace/actions/create';
import { deleteAction, trashAction } from '~/modules/workspace/actions/delete';
import { downloadAndSaveAction } from '~/modules/workspace/actions/download';
import { listAction } from '~/modules/workspace/actions/list';
import { moveAction } from '~/modules/workspace/actions/move';
import { pastAction } from '~/modules/workspace/actions/past';
import { renameAction } from '~/modules/workspace/actions/rename';
import { restoreAction } from '~/modules/workspace/actions/restore';
import { uploadAction } from '~/modules/workspace/actions/upload';
import { ContentUri, FilterId } from '~/modules/workspace/types';

export const addMenu = () => ({
  text: I18n.t('add-file'),
  icon: 'file-plus',
  id: 'addDocument',
  wrapper: ({ children, dispatch, parentId, filter }) => (
    <FilePicker
      multiple
      callback={async file => {
        const convertedFile: ContentUri = {
          mime: file.type,
          name: file.fileName,
          uri: file.uri,
          path: file.uri,
        };
        await dispatch(uploadAction(parentId, convertedFile));
        await dispatch(
          listAction(
            parentId && filter
              ? { parentId, filter }
              : parentId
              ? { parentId }
              : { filter: FilterId.owner, parentId: FilterId.owner },
          ),
        );
      }}>
      {children}
    </FilePicker>
  ),
});

export const createMenu = () => ({
  text: I18n.t('create-folder'),
  icon: 'added_files',
  id: 'AddFolder',
  dialog: {
    title: I18n.t('create-folder'),
    input: true,
    okLabel: I18n.t('create'),
  },
  onEvent: ({ dispatch, parentId, value }) => {
    Trackers.trackEvent('Workspace', 'CREATE', 'Folder');
    if (parentId === 'owner') {
      dispatch(createFolderAction(value));
    } else {
      dispatch(createFolderAction(value, parentId));
    }
  },
});

export const trashMenu = () => ({
  text: I18n.t('delete'),
  icon: 'delete',
  id: 'delete',
  dialog: {
    title: I18n.t('trash-confirm'),
    okLabel: I18n.t('delete'),
  },
  onEvent: ({ dispatch, parentId, selected }) => dispatch(trashAction(parentId, selected)),
});

export const deleteMenu = () => ({
  text: I18n.t('delete'),
  icon: 'delete',
  id: 'delete',
  dialog: {
    title: I18n.t('delete-confirm'),
    okLabel: I18n.t('delete'),
  },
  onEvent: ({ dispatch, parentId, selected }) => dispatch(deleteAction(parentId, selected)),
});

export const downloadMenu = () => ({
  text: I18n.t('download'),
  icon: 'download',
  id: 'download',
  options: { onlyFiles: true },
  dialog: {
    title: I18n.t('download-documents'),
    okLabel: I18n.t('download'),
  },
  onEvent: ({ dispatch, selected }) => dispatch(downloadAndSaveAction(selected)),
});

export const restoreMenu = () => ({
  text: 'restore',
  icon: 'restore',
  id: 'restore',
  onEvent: ({ dispatch, parentId, selected }) => dispatch(restoreAction(parentId, selected)),
});

export const copyMenu = () => ({
  text: I18n.t('copy'),
  icon: 'content-copy',
  id: 'copy',
  writeAccess: true,
  dialog: {
    title: I18n.t('copy-documents'),
    okLabel: I18n.t('copy'),
    selectDestination: true,
  },
  onEvent: ({ dispatch, selected, value }) => dispatch(pastAction(value, selected)),
});

export const moveMenu = () => ({
  text: I18n.t('move'),
  icon: 'package-up',
  id: 'move',
  writeAccess: true,
  dialog: {
    title: I18n.t('move-documents'),
    okLabel: I18n.t('move'),
    selectDestination: true,
  },
  onEvent: ({ dispatch, parentId, selected, value }) => dispatch(moveAction(value, parentId, selected)),
});

export const renameMenu = () => ({
  text: I18n.t('Edit'),
  icon: 'pencil',
  id: 'edit',
  options: { monoselection: true },
  dialog: {
    title: I18n.t('rename'),
    input: 'name',
    okLabel: I18n.t('modify'),
  },
  onEvent: ({ dispatch, parentId, selected, value }) => dispatch(renameAction(parentId, selected, value)),
});
