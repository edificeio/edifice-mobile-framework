import * as React from 'react';
import { LayoutChangeEvent, TouchableOpacity, View } from 'react-native';

import { SvgIconName } from '~/framework/components/picture';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { MediaPreview } from '~/framework/modules/home/components/media-preview';
import blockStyles from '~/framework/modules/home/components/styles';
import { Image } from '~/framework/modules/media/components/image';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import newsModuleConfig from '~/framework/modules/news/module-config';
import type { NewsThreadItemReduce } from '~/framework/modules/news/screens/home/types';
import { extractMediaFromHtml, extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { sessionImageSource } from '~/framework/util/transport';

import { NEWS_BACKGROUNDS, TEXT_LINE_HEIGHT, THUMBNAIL_ICON_SIZE, TITLE_LINES } from '../constants';
import styles from './styles';
import { NewsCardProps } from './types';

const ThreadThumbnail = React.memo(({ icon }: { icon: NewsThreadItemReduce['icon'] }) => {
  const appTheme = useAppTheme(newsModuleConfig.name);
  const source = React.useMemo(() => (icon ? sessionImageSource(icon) : undefined), [icon]);

  const fallback = React.useMemo(
    () => ({ accentColors: appTheme.colors, icon: { name: 'actualites' as SvgIconName, type: 'Svg' as const } }),
    [appTheme.colors],
  );
  return (
    <View style={styles.thumbnail}>
      <Image source={source} fallback={fallback} iconSize={THUMBNAIL_ICON_SIZE} style={styles.thumbnailImage} />
    </View>
  );
});

export const NewsCard = React.memo(({ item, onPress }: NewsCardProps) => {
  const { news, thread } = item;
  const onCardPress = React.useCallback(() => onPress(item), [item, onPress]);

  const text = React.useMemo(() => extractTextFromHtml(news.content) ?? '', [news.content]);
  const images = React.useMemo(
    () => extractMediaFromHtml(news.content)?.filter(media => media.type === 'image') ?? [],
    [news.content],
  );
  const backgroundColor = news.headline ? NEWS_BACKGROUNDS.headline : NEWS_BACKGROUNDS.standard;

  // Every card is the same height, so the text takes what the title and the images leave and is cut
  // at the last line that fits. That room is measured, as it depends on the title being one or two
  // lines long and on the news carrying images or not.
  const [textLines, setTextLines] = React.useState<number>(0);
  const measured = React.useRef<boolean>(false);
  const onTextAreaLayout = React.useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    // Only the first pass measures: once the text is in, the room it is given is its own height.
    if (measured.current) return;
    measured.current = true;
    setTextLines(Math.floor(nativeEvent.layout.height / TEXT_LINE_HEIGHT));
  }, []);

  const cardStyle = React.useMemo(() => [blockStyles.block, styles.card, { backgroundColor }], [backgroundColor]);

  return (
    <TouchableOpacity style={cardStyle} onPress={onCardPress} activeOpacity={0.7}>
      <View style={blockStyles.blockHeader}>
        <ThreadThumbnail icon={thread.icon} />
        <SmallText style={styles.threadTitle} numberOfLines={1}>
          {thread.title}
        </SmallText>
      </View>
      <View style={[blockStyles.blockBody, styles.body]}>
        <HeadingXSText numberOfLines={TITLE_LINES}>{news.title}</HeadingXSText>
        <View style={[styles.textArea, textLines ? styles.textAreaMeasured : null]} onLayout={onTextAreaLayout}>
          {text && textLines ? <SmallText numberOfLines={textLines}>{text}</SmallText> : null}
        </View>
        {images.length ? <MediaPreview media={images} /> : null}
      </View>
    </TouchableOpacity>
  );
});
