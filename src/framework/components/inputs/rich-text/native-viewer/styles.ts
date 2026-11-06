import { ColorValue, StyleSheet, TextStyle } from 'react-native';

import type { EnrichedTextHtmlStyle } from 'react-native-enriched-html';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

const styles = StyleSheet.create({
  container: {
    gap: UI_SIZES.spacing.minor,
  },
});

export const ENRICHED_TEXT_STYLE: TextStyle = {
  ...TextFontStyle.Regular,
  ...TextSizeStyle.Normal,
  color: theme.palette.grey.black,
};

export const ENRICHED_TEXT_HTML_STYLE: EnrichedTextHtmlStyle = {
  a: {
    color: theme.palette.primary.regular,
    pressColor: theme.palette.primary.dark,
    textDecorationLine: 'underline',
  },
  blockquote: {
    borderColor: theme.palette.grey.pearl,
    color: theme.palette.grey.graphite,
  },
  code: {
    backgroundColor: theme.palette.grey.fog,
    color: theme.palette.grey.black,
  },
  codeblock: {
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.small,
    color: theme.palette.grey.black,
  },
  h1: { bold: true, fontSize: TextSizeStyle.Huge.fontSize },
  h2: { bold: true, fontSize: TextSizeStyle.Bigger.fontSize },
  h3: { bold: true, fontSize: TextSizeStyle.Big.fontSize },
  h4: { bold: true, fontSize: TextSizeStyle.Medium.fontSize },
  h5: { bold: true, fontSize: TextSizeStyle.Normal.fontSize },
  h6: { bold: true, fontSize: TextSizeStyle.Small.fontSize },
  ol: { markerColor: theme.palette.grey.black },
  ul: { bulletColor: theme.palette.grey.black },
};

export const getContainerStyle = (backgroundColor?: ColorValue) =>
  backgroundColor ? [styles.container, { backgroundColor }] : styles.container;

export default styles;
