import * as React from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SvgIconName } from '~/framework/components/picture';
import { HeadingXSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import newsModuleConfig from '~/framework/modules/news/module-config';
import type { NewsThreadItemReduce } from '~/framework/modules/news/screens/home/types';
import { extractMediaFromHtml, extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { Image } from '~/framework/util/media/components/image';
import type { INotificationMedia } from '~/framework/util/notifications';
import { sessionImageSource } from '~/framework/util/transport';

import { NEWS_BACKGROUNDS, PREVIEW_IMAGES, TEXT_LINE_HEIGHT, THUMBNAIL_ICON_SIZE, TITLE_LINES } from '../constants';
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

const NewsImages = React.memo(({ images }: { images: INotificationMedia[] }) => {
  const remaining = images.length - PREVIEW_IMAGES;
  const shown = images.slice(0, remaining > 0 ? PREVIEW_IMAGES + 1 : PREVIEW_IMAGES);

  return (
    <View style={styles.images}>
      {shown.map((image, index) => {
        const source = sessionImageSource({ uri: image.src as string });
        const isLast = remaining > 0 && index === PREVIEW_IMAGES;

        return isLast ? (
          <View key={index} style={styles.moreImage}>
            <Image source={source} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.moreOverlay]} />
            <SmallBoldText style={styles.moreCount}>+{remaining}</SmallBoldText>
          </View>
        ) : (
          <View key={index} style={[styles.image, shown.length === 1 && styles.imageAlone]}>
            <Image source={source} style={styles.imageContent} />
          </View>
        );
      })}
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

  const cardStyle = React.useMemo(() => [styles.card, { backgroundColor }], [backgroundColor]);

  return (
    <TouchableOpacity style={cardStyle} onPress={onCardPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <ThreadThumbnail icon={thread.icon} />
        <SmallText style={styles.threadTitle} numberOfLines={1}>
          {thread.title}
        </SmallText>
      </View>
      <View style={styles.body}>
        <HeadingXSText numberOfLines={TITLE_LINES}>{news.title}</HeadingXSText>
        <View style={[styles.textArea, textLines ? styles.textAreaMeasured : null]} onLayout={onTextAreaLayout}>
          {text && textLines ? <SmallText numberOfLines={textLines}>{text}</SmallText> : null}
        </View>
        {images.length ? <NewsImages images={images} /> : null}
      </View>
    </TouchableOpacity>
  );
});
