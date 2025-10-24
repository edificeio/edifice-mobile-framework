import { DocumentItem, FolderItem, PaginatedDocumentListItem } from './types';

import { PaginatedFlashListProps } from '~/framework/components/list/paginated-list';

/**
 * Symbol used to represent a spacer ensuring that folders are not on the same line as documents.
 */
export const FOLDER_SPACER_ITEM_DATA = Symbol('FOLDER_SPACER_ITEM_DATA');

/**
 * Symbol used to represent a spacer ensuring that items are a multiple of the number of columns.
 */
export const DOCUMENT_SPACER_ITEM_DATA = Symbol('DOCUMENT_SPACER_ITEM_DATA');

export const createDocumentArrayProxy = (
  folders: NonNullable<PaginatedFlashListProps<FolderItem>['data']>,
  documents: NonNullable<PaginatedFlashListProps<DocumentItem>['data']>,
  numColumns: number = 1,
): { data: NonNullable<PaginatedFlashListProps<PaginatedDocumentListItem>['data']>; documentsIndexStart: number } => {
  if (!Number.isInteger(numColumns) || numColumns <= 0) {
    throw new TypeError('createDocumentArrayProxy: numColumns must be a positive non-null integer.');
  }
  const totalFolderSpacers = (numColumns - (folders.length % numColumns)) % numColumns;
  const totalDocumentSpacers = (numColumns - (documents.length % numColumns)) % numColumns;
  const data = new Proxy(documents, {
    get(target, prop, receiver) {
      // Length of array
      if (prop === 'length') {
        return folders.length + totalFolderSpacers + target.length + totalDocumentSpacers;
      }

      // Index access
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const index = Number(prop);
        if (index < folders.length) {
          return folders[index];
        } else if (index < folders.length + totalFolderSpacers) {
          return FOLDER_SPACER_ITEM_DATA;
        } else if (index < folders.length + totalFolderSpacers + target.length) {
          return target[index - folders.length - totalFolderSpacers];
        } else {
          return DOCUMENT_SPACER_ITEM_DATA;
        }
      }

      // Other props bound to the documents array
      const value = target[prop];
      if (value instanceof Function) {
        return function (this: typeof receiver | typeof target, ...args: any[]) {
          return value.apply(this === receiver ? target : this, args);
        };
      }
      return value;
    },

    has(target, prop) {
      // Index access
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const index = Number(prop);
        return index >= 0 && index < folders.length + totalFolderSpacers + target.length + totalDocumentSpacers;
      }

      // Other props bound to the documents array
      return Object.hasOwn(target, prop);
    },

    ownKeys(target) {
      return [...Array(folders.length + totalFolderSpacers + target.length + totalDocumentSpacers).keys()].map(String);
    },

    set(_target, _prop, _newValue, _receiver) {
      throw new TypeError('createDocumentArrayProxy: elements cannot be set.');
    },
  });

  return { data, documentsIndexStart: folders.length + totalFolderSpacers };
};
