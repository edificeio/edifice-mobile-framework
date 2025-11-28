import React, { ReactElement } from 'react';

export const createDecoratedArrayProxy = <ItemT,>(
  stickyItems: ReactElement[],
  _data: ItemT[],
  numColumns: number = 1,
): {
  data: (ItemT | ReactElement)[];
  stickyItemsPadding: number;
} => {
  const stickyItemsPadding = stickyItems.length * numColumns;
  const data = new Proxy(_data, {
    get(target, prop, receiver) {
      // Length of array
      if (prop === 'length') {
        return stickyItemsPadding + target.length;
      }

      // Index access
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const index = Number(prop);
        if (index < stickyItemsPadding) {
          return index % numColumns === 0 ? stickyItems[index / numColumns] : <></>;
        } else {
          return target[index - stickyItemsPadding];
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
        return index >= 0 && index < stickyItemsPadding + target.length;
      }

      // Other props bound to the documents array
      return Object.hasOwn(target, prop);
    },

    ownKeys(target) {
      return [...Array(stickyItemsPadding + target.length).keys()].map(String);
    },

    set(_target, _prop, _newValue, _receiver) {
      throw new TypeError('createDecoratedArrayProxy: elements cannot be set.');
    },
  });

  return { data, stickyItemsPadding };
};

// export const createCommunityDocumentArrayProxy = (
//   stickyItems: ReactElement[],
//   folders: NonNullable<PaginatedFlatListProps<FolderItem>['data']>,
//   documents: NonNullable<PaginatedFlatListProps<DocumentItem>['data']>,
//   numColumns: number = 1,
// ): {
//   data: NonNullable<PaginatedFlatListProps<CommunityPaginatedDocumentListItem>['data']>;
//   totalFolders: number;
//   stickyItemsPadding: number;
//   totalDocumentSpacers: number;
// } => {
//   const { data: _data, totalFolders } = createDocumentArrayProxy(folders, documents, numColumns);
//   const totalDocumentSpacers = (numColumns - (documents.length % numColumns)) % numColumns;

//   const stickyItemsPadding = stickyItems.length * numColumns;

//   const data = new Proxy(_data, {
//     get(target, prop, receiver) {
//       // Length of array
//       if (prop === 'length') {
//         return stickyItemsPadding + target.length + totalDocumentSpacers;
//       }

//       // Index access
//       if (typeof prop === 'string' && !isNaN(Number(prop))) {
//         const index = Number(prop);
//         if (index < stickyItemsPadding) {
//           return index % numColumns === 0 ? stickyItems[index / numColumns] : <></>;
//         } else if (index < stickyItemsPadding + target.length) {
//           return target[index - stickyItemsPadding];
//         } else {
//           return <></>; // Document spacer
//         }
//       }

//       // Other props bound to the documents array
//       const value = target[prop];
//       if (value instanceof Function) {
//         return function (this: typeof receiver | typeof target, ...args: any[]) {
//           return value.apply(this === receiver ? target : this, args);
//         };
//       }
//       return value;
//     },

//     has(target, prop) {
//       // Index access
//       if (typeof prop === 'string' && !isNaN(Number(prop))) {
//         const index = Number(prop);
//         return index >= 0 && index < stickyItemsPadding + target.length + totalDocumentSpacers;
//       }

//       // Other props bound to the documents array
//       return Object.hasOwn(target, prop);
//     },

//     ownKeys(target) {
//       return [...Array(stickyItemsPadding + target.length + totalDocumentSpacers).keys()].map(String);
//     },

//     set(_target, _prop, _newValue, _receiver) {
//       throw new TypeError('createCommunityDocumentArrayProxy: elements cannot be set.');
//     },
//   });

//   return { data, stickyItemsPadding, totalDocumentSpacers, totalFolders };
// };
