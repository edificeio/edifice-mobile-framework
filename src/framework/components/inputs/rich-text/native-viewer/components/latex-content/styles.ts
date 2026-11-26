import type { MarkdownStyle } from 'react-native-enriched-markdown';

import theme from '~/app/theme';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

// Theme colors are hex strings, `markdownStyle` only accepts strings
const TEXT_COLOR = theme.palette.grey.black as string;

const LATEX_TEXT_STYLE = {
  color: TEXT_COLOR,
  fontFamily: TextFontStyle.Regular.fontFamily,
  fontSize: TextSizeStyle.Big.fontSize,
  marginBottom: 0,
  marginTop: 0,
};

export const LATEX_MARKDOWN_STYLE: MarkdownStyle = {
  code: { backgroundColor: theme.palette.grey.fog as string, color: TEXT_COLOR },
  math: { ...LATEX_TEXT_STYLE, padding: 0, textAlign: 'center' },
  paragraph: { ...LATEX_TEXT_STYLE, lineHeight: TextSizeStyle.Normal.lineHeight, textAlign: 'center' },
};
