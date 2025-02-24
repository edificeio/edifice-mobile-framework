/**
 * Data model for the module explorer
 */

import type { ExplorerFolderData, Folder, Resource } from './types';

export const explorerItemIsLoading = (item: ExplorerFolderData['items'][0]) => item === null;

export const explorerItemIsFolder = (item: ExplorerFolderData['items'][0]): item is Folder => item?.resourceType === 'folder';

export const explorerItemIsResource = (item: ExplorerFolderData['items'][0]): item is Resource => item?.resourceType !== 'folder';
