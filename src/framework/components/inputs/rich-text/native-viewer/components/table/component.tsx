import * as React from 'react';
import { ScrollView, View } from 'react-native';

import type { RichContentTableCell } from '~/framework/components/inputs/rich-text/native-viewer/types';

import styles, { DEFAULT_COLUMN_WIDTH, getCellStyle } from './styles';
import { TableProps } from './types';

/**
 * Columns have a fixed width, shared by all rows to keep them aligned: the table is scrolled horizontally when it is
 * wider than the screen. A row is as high as its highest cell.
 */
const Table = ({ renderCellContent, segment }: Readonly<TableProps>) => {
  const { columnWidths, rows } = segment;
  const widths = React.useMemo(() => columnWidths.map(width => width ?? DEFAULT_COLUMN_WIDTH), [columnWidths]);

  const renderRow = (row: RichContentTableCell[], rowIndex: number) => {
    let columnIndex = 0;
    return (
      <View key={rowIndex} style={styles.row}>
        {row.map(cell => {
          const firstColumn = columnIndex;
          const cellWidth = widths.slice(firstColumn, firstColumn + cell.colspan).reduce((total, width) => total + width, 0);
          columnIndex += cell.colspan;
          return (
            <View key={firstColumn} style={getCellStyle(cellWidth, cell)}>
              {renderCellContent(cell.segments, cell.isHeader)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView horizontal nestedScrollEnabled testID="rich-content-table">
      <View style={styles.table}>{rows.map((row, rowIndex) => renderRow(row, rowIndex))}</View>
    </ScrollView>
  );
};

export default Table;
