import * as React from 'react';
import { ColorValue, TextLayoutEvent, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import type { IEntcoreFlashMessage } from '~/framework/modules/timeline/reducer/flash-messages';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import HtmlContentView from '~/ui/HtmlContentView';

import { MESSAGE_TINTS } from '../constants';
import { ARC_HEIGHT, ARC_WIDTH, COLLAPSED_LINES, HTML_OPTIONS, ICON_SIZE } from './constants';
import styles from './styles';
import { FlashMessageProps } from './types';

const getContent = (contents: IEntcoreFlashMessage['contents']) =>
  contents?.[I18n.getLanguage()] ?? (contents ? contents[Object.keys(contents)[0]] : undefined);

const FlashMessageArc = React.memo(({ color }: { color: ColorValue }) => {
  return (
    <View style={styles.arc}>
      <Svg name="ui-flash-message-arc" fill={color} width={ARC_WIDTH} height={ARC_HEIGHT} />
    </View>
  );
});

const FlashMessageIcon = React.memo(({ color, name }: { color: ColorValue; name: SvgIconName }) => {
  const style = React.useMemo(() => [styles.iconWrapper, { backgroundColor: color }], [color]);

  return (
    <View style={style}>
      <Svg name={name} fill={theme.palette.grey.white} width={ICON_SIZE} height={ICON_SIZE} />
    </View>
  );
});

export const FlashMessage = React.memo(({ flashMessage, onDismiss }: FlashMessageProps) => {
  // `undefined` until the text is measured, so nothing is truncated before its length is known.
  const [expandable, setExpandable] = React.useState<boolean | undefined>(undefined);
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const onTextLayout = React.useCallback(
    ({ nativeEvent }: TextLayoutEvent) => setExpandable(nativeEvent.lines.length > COLLAPSED_LINES),
    [],
  );

  const toggleExpand = React.useCallback(() => setExpanded(value => !value), []);
  const dismiss = React.useCallback(() => onDismiss(flashMessage.id), [flashMessage.id, onDismiss]);

  const html = getContent(flashMessage.contents);
  const text = React.useMemo(() => extractTextFromHtml(html ?? '') ?? '', [html]);
  const tint = MESSAGE_TINTS[flashMessage.color ?? 'blue'];

  const showClose = expandable === false || expanded;

  const cardStyle = React.useMemo(
    () => [styles.card, { backgroundColor: tint.background, borderColor: tint.accent }],
    [tint.accent, tint.background],
  );

  if (!html) return null;

  return (
    <View style={cardStyle}>
      <FlashMessageArc color={tint.arc} />
      <View style={styles.header}>
        <FlashMessageIcon color={tint.accent} name={tint.icon} />
        <View style={[styles.content, showClose && styles.contentWithClose]}>
          {flashMessage.title ? <SmallBoldText style={styles.title}>{flashMessage.title}</SmallBoldText> : null}
          {expanded ? (
            <HtmlContentView html={html} opts={HTML_OPTIONS} />
          ) : (
            <SmallText style={styles.previewBody} numberOfLines={COLLAPSED_LINES} ellipsizeMode="tail">
              {text}
            </SmallText>
          )}
          {expandable === undefined ? (
            <SmallText style={styles.measure} onTextLayout={onTextLayout}>
              {text}
            </SmallText>
          ) : null}
        </View>
        {showClose ? (
          <IconButton icon="ui-close" style={styles.closeButton} color={theme.palette.secondary.dark} action={dismiss} />
        ) : null}
      </View>
      <View style={styles.footer}>
        <SmallItalicText style={styles.signature} ellipsizeMode="tail" numberOfLines={2}>
          {flashMessage.signature}
        </SmallItalicText>
        {expandable ? (
          <TertiaryButton
            style={styles.moreLessButton}
            text={I18n.get(expanded ? 'textpreview-seeless' : 'textpreview-seemore')}
            contentColor={theme.palette.secondary.dark}
            action={toggleExpand}
          />
        ) : null}
      </View>
    </View>
  );
});
