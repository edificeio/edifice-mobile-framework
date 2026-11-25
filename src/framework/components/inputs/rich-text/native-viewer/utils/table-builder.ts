/**
 * Builds the `TABLE` segment of a table found by the parser: rows, cells (with colspan, rowspan and background color)
 * and column widths. Only table structure tags are read here.
 */
import {
  RichContentSegment,
  RichContentSegmentType,
  RichContentTableCell,
} from '~/framework/components/inputs/rich-text/native-viewer/types';

import { getAttributes, getBackgroundColor, ParsedTag, TAG_REGEX, toParsedTag } from './html-tokenizer';

type SplitContent = (html: string) => RichContentSegment[];

// `width` only, not `min-width` (always set by Tiptap on `<col>`)
const WIDTH_REGEX = /(?:^|;)\s*width\s*:\s*([\d.]+)px/i;

interface TableBuilder {
  // Column of the next cell in the current row
  columnIndex: number;
  columnWidths: (number | undefined)[];
  currentRow?: RichContentTableCell[];
  // Number of `<col>` read, to know the column of the next one
  declaredColumnCount: number;
  // Whether the current row has a cell that is not a rowspan filler: Tiptap keeps an empty `<tr>` for each row fully
  // covered by rowspans
  hasNonFillerCell: boolean;
  html: string;
  openCell?: { attributes: Record<string, string>; contentStart: number; isHeader: boolean };
  rows: RichContentTableCell[][];
  // Cells of a previous row with a rowspan, by first column: the number of rows still covered, and how to fill them
  rowspans: Map<number, { backgroundColor?: string; colspan: number; isHeader: boolean; remainingRows: number }>;
  splitContent: SplitContent;
}

// Number of columns (colspan) or rows (rowspan) spanned by a cell, itself included: 1 means no merge.
const parseSpan = (value?: string): number => Math.max(1, Number.parseInt(value ?? '', 10) || 1);

const setColumnWidth = (builder: TableBuilder, columnIndex: number, rawWidth?: string) => {
  const width = rawWidth ? Number.parseFloat(rawWidth) : Number.NaN;
  if (width > 0 && builder.columnWidths[columnIndex] === undefined) builder.columnWidths[columnIndex] = width;
};

// A cell with a rowspan stays in its own row: an empty filler cell takes its place in the next rows, to keep columns aligned
const fillSpannedColumns = (builder: TableBuilder) => {
  let rowspan = builder.rowspans.get(builder.columnIndex);
  while (rowspan && builder.currentRow) {
    const { backgroundColor, colspan, isHeader } = rowspan;
    builder.currentRow.push({ backgroundColor, colspan, isHeader, isRowspanFiller: true, segments: [] });
    rowspan.remainingRows -= 1;
    if (rowspan.remainingRows <= 0) builder.rowspans.delete(builder.columnIndex);
    builder.columnIndex += colspan;
    rowspan = builder.rowspans.get(builder.columnIndex);
  }
};

const closeTableCell = (builder: TableBuilder, end: number) => {
  const { currentRow, openCell } = builder;
  if (!openCell || !currentRow) return;
  builder.openCell = undefined;
  fillSpannedColumns(builder);
  const { attributes } = openCell;
  const colspan = parseSpan(attributes.colspan);
  const rowspan = parseSpan(attributes.rowspan);
  const backgroundColor = getBackgroundColor(attributes.style);
  // Tiptap stores the width of resized columns on the cells: one value per spanned column
  attributes.colwidth?.split(',').forEach((width, index) => setColumnWidth(builder, builder.columnIndex + index, width));
  if (rowspan > 1) {
    builder.rowspans.set(builder.columnIndex, {
      backgroundColor,
      colspan,
      isHeader: openCell.isHeader,
      remainingRows: rowspan - 1,
    });
  }
  builder.hasNonFillerCell = true;
  currentRow.push({
    backgroundColor,
    colspan,
    isHeader: openCell.isHeader,
    segments: builder.splitContent(builder.html.slice(openCell.contentStart, end)),
  });
  builder.columnIndex += colspan;
};

const closeTableRow = (builder: TableBuilder, end: number) => {
  closeTableCell(builder, end);
  if (!builder.currentRow) return;
  // Rows still covered by a rowspan are counted even when the row is not displayed
  fillSpannedColumns(builder);
  // A row with only filler cells has no height on the web: the cells with a rowspan cover it
  if (builder.hasNonFillerCell) builder.rows.push(builder.currentRow);
  builder.currentRow = undefined;
};

const openTableRow = (builder: TableBuilder, start: number) => {
  closeTableRow(builder, start);
  builder.currentRow = [];
  builder.columnIndex = 0;
  builder.hasNonFillerCell = false;
};

// Only table structure tags are read here: the content of the cells is handled by their own split
const handleTableStructureTag = (builder: TableBuilder, tag: ParsedTag) => {
  if (tag.tagName === 'col' && !tag.isClosing) {
    const style = getAttributes(tag.rawAttributes).style ?? '';
    setColumnWidth(builder, builder.declaredColumnCount, WIDTH_REGEX.exec(style)?.[1]);
    builder.declaredColumnCount += 1;
  } else if (tag.tagName === 'tr') {
    if (tag.isClosing) closeTableRow(builder, tag.start);
    else openTableRow(builder, tag.start);
  } else if (tag.tagName === 'td' || tag.tagName === 'th') {
    closeTableCell(builder, tag.start);
    if (tag.isClosing) return;
    if (!builder.currentRow) openTableRow(builder, tag.start);
    const attributes = getAttributes(tag.rawAttributes);
    builder.openCell = { attributes, contentStart: tag.end, isHeader: tag.tagName === 'th' };
  }
};

/**
 * Builds the rows and cells of a table from its inner html (between `<table>` and `</table>`).
 * `splitContent` splits the content of a cell into segments: given by the parser, to avoid an import cycle.
 */
export const buildTableSegment = (html: string, splitContent: SplitContent): RichContentSegment | undefined => {
  const builder: TableBuilder = {
    columnIndex: 0,
    columnWidths: [],
    declaredColumnCount: 0,
    hasNonFillerCell: false,
    html,
    rows: [],
    rowspans: new Map(),
    splitContent,
  };
  // Tags of tables nested in a cell belong to that cell's content
  let nestedTableDepth = 0;
  for (const match of html.matchAll(TAG_REGEX)) {
    const tag = toParsedTag(match);
    if (tag.tagName === 'table' && !tag.isSelfClosing) {
      nestedTableDepth = Math.max(0, nestedTableDepth + (tag.isClosing ? -1 : 1));
    } else if (nestedTableDepth === 0) {
      handleTableStructureTag(builder, tag);
    }
  }
  closeTableRow(builder, html.length);
  if (!builder.rows.length) return undefined;
  const columnCount = Math.max(...builder.rows.map(row => row.reduce((count, cell) => count + cell.colspan, 0)));
  return {
    columnWidths: Array.from({ length: columnCount }, (_, index) => builder.columnWidths[index]),
    rows: builder.rows,
    type: RichContentSegmentType.TABLE,
  };
};
