/**
 * Data model for the module explorer
 */

import type { ExplorerFolderContent, Folder, Resource } from './types';

export const explorerItemIsLoading = (item: ExplorerFolderContent['items'][0]) => item === null;

export const explorerItemIsFolder = (item: ExplorerFolderContent['items'][0]): item is Folder => item?.resourceType === 'folder';

export const explorerItemIsResource = (item: ExplorerFolderContent['items'][0]): item is Resource => item?.resourceType !== 'folder';
