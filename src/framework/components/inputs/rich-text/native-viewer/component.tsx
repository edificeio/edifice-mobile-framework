import * as React from 'react';
import { View } from 'react-native';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { EnrichedText, OnLinkPressEvent } from 'react-native-enriched-html';
import { useSelector } from 'react-redux';

import { NavigationRootParams } from '~/app/navigation/types';
import { IGlobalState } from '~/app/store';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { openMedias } from '~/framework/modules/media';
import { openUrl } from '~/framework/util/linking';

import Pane from './components/pane';
import AttachmentPreview from './components/preview/attachment';
import ImagePreview from './components/preview/image';
import MediaPreview from './components/preview/media';
import { ENRICHED_TEXT_HTML_STYLE, ENRICHED_TEXT_STYLE, getContainerStyle } from './styles';
import { RichContentSegment, RichContentSegmentType, RichEditorNativeViewerProps } from './types';
import { buildCarouselMedias, findMediaIndex, splitRichContent } from './util';

const onOpenLink = (url: string) => {
  openUrl(url);
};

const onLinkPress = ({ url }: OnLinkPressEvent) => onOpenLink(url);

/**
 * Read-only rich content viewer without WebView, made to be rendered many times in a list.
 * Text is rendered natively by `react-native-enriched-html`, images and other medias by preview components.
 */
const RichEditorNativeViewer = ({ backgroundColor, content }: Readonly<RichEditorNativeViewerProps>) => {
  const navigation = useNavigation<NavigationProp<NavigationRootParams>>();
  const platformUrl = useSelector((state: IGlobalState) => selectors.session(state)?.platform.url);
  const segments = React.useMemo(() => splitRichContent(content, platformUrl), [content, platformUrl]);
  const medias = React.useMemo(() => buildCarouselMedias(segments), [segments]);
  const containerStyle = React.useMemo(() => getContainerStyle(backgroundColor), [backgroundColor]);

  const onOpenMedia = React.useCallback(
    (url: string) => openMedias(navigation, medias, findMediaIndex(medias, url, platformUrl)),
    [medias, navigation, platformUrl],
  );

  const renderSegment = (segment: RichContentSegment, index: number) => {
    switch (segment.type) {
      case RichContentSegmentType.HTML:
        return (
          <EnrichedText key={index} style={ENRICHED_TEXT_STYLE} htmlStyle={ENRICHED_TEXT_HTML_STYLE} onLinkPress={onLinkPress}>
            {segment.html}
          </EnrichedText>
        );
      case RichContentSegmentType.IMAGE:
        return <ImagePreview key={index} src={segment.src} declaredSize={segment.declaredSize} onPress={onOpenMedia} />;
      case RichContentSegmentType.PANE:
        return (
          <Pane key={index} type={segment.paneType}>
            {segment.segments.map(renderSegment)}
          </Pane>
        );
      case RichContentSegmentType.ATTACHMENTS:
        return segment.items.map(attachment => (
          <AttachmentPreview key={`${index}-${attachment.href}`} attachment={attachment} onPress={onOpenMedia} />
        ));
      default:
        return <MediaPreview key={index} segment={segment} onOpenMedia={onOpenMedia} onOpenLink={onOpenLink} />;
    }
  };

  return <View style={containerStyle}>{segments.map(renderSegment)}</View>;
};

export default React.memo(RichEditorNativeViewer);
