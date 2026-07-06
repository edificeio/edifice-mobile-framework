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

  const stickyColumnsData = new Array(stickyItemsPadding).fill(<></>);
  stickyItems.forEach((_, index) => {
    stickyColumnsData[index * numColumns] = stickyItems[index];
  });

  return { data: [...stickyColumnsData, ..._data], stickyItemsPadding };
};
