import { StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import type { RichContentTableCell } from '~/framework/components/inputs/rich-text/native-viewer/types';

// Used for the columns without a width in the html: about 2.5 columns visible on screen, the others are scrolled to
export const DEFAULT_COLUMN_WIDTH = UI_SIZES.screen.width / 2.5;

const CELL_STYLE: ViewStyle = {
  borderColor: theme.palette.grey.grey,
  borderLeftWidth: UI_SIZES.elements.border.default,
  borderTopWidth: UI_SIZES.elements.border.default,
  gap: UI_SIZES.spacing.tiny,
  padding: UI_SIZES.spacing.tiny,
};

// Same look as the web editor (Tiptap `.ProseMirror table`): collapsed 2px borders, no radius, bold header on a grey
// background, small padding. Web colors (#CED4DA borders, #F1F3F5 header) are replaced by the closest theme colors.
const styles = StyleSheet.create({
  cell: CELL_STYLE,
  headerCell: {
    ...CELL_STYLE,
    backgroundColor: theme.palette.grey.pearl,
  },
  row: {
    flexDirection: 'row',
  },
  // No line between a cell with a rowspan and its filler cells in the next rows
  rowspanFiller: {
    borderTopWidth: 0,
  },
  // Cells only draw their top and left borders, the table draws the right and bottom ones: every line is drawn once,
  // like the web `border-collapse: collapse`
  table: {
    borderBottomWidth: UI_SIZES.elements.border.default,
    borderColor: theme.palette.grey.grey,
    borderRightWidth: UI_SIZES.elements.border.default,
  },
});

export const getCellStyle = (
  width: number,
  { backgroundColor, isHeader, isRowspanFiller }: Pick<RichContentTableCell, 'backgroundColor' | 'isHeader' | 'isRowspanFiller'>,
) => [
  isHeader ? styles.headerCell : styles.cell,
  { width },
  backgroundColor ? { backgroundColor } : undefined,
  isRowspanFiller ? styles.rowspanFiller : undefined,
];

export default styles;
