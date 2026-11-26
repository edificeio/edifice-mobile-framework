import * as React from 'react';
import { TextStyle, View } from 'react-native';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { EnrichedText, OnLinkPressEvent } from 'react-native-enriched-html';
import { useSelector } from 'react-redux';

import { NavigationRootParams } from '~/app/navigation/types';
import { IGlobalState } from '~/app/store';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { openMedias } from '~/framework/modules/media';
import { openUrl } from '~/framework/util/linking';

import LatexContent from './components/latex-content';
import Pane from './components/pane';
import AttachmentPreview from './components/preview/attachment';
import ImagePreview from './components/preview/image';
import MediaPreview from './components/preview/media';
import Table from './components/table';
import styles, { ENRICHED_TEXT_HEADER_STYLE, ENRICHED_TEXT_HTML_STYLE, ENRICHED_TEXT_STYLE } from './styles';
import { RichContentSegment, RichContentSegmentType, RichEditorNativeViewerProps } from './types';
import { buildCarouselMedias, findMediaIndex } from './utils/carousel';
import { splitRichContent } from './utils/parser';

const onOpenLink = (url: string) => {
  openUrl(url).catch(e => console.error('Error while opening rich content link', e));
};

const onLinkPress = ({ url }: OnLinkPressEvent) => onOpenLink(url);

const RichEditorNativeViewer = ({ content }: Readonly<RichEditorNativeViewerProps>) => {
  const navigation = useNavigation<NavigationProp<NavigationRootParams>>();
  const platformUrl = useSelector((state: IGlobalState) => selectors.session(state)?.platform.url);
  const segments = React.useMemo(() => splitRichContent(content, platformUrl), [content, platformUrl]);
  const medias = React.useMemo(() => buildCarouselMedias(segments), [segments]);

  const onOpenMedia = React.useCallback(
    (url: string) => openMedias(navigation, medias, findMediaIndex(medias, url, platformUrl)),
    [medias, navigation, platformUrl],
  );

  // `textStyle` is given to the text of nested segments too (e.g. bold text of table header cells)
  const renderSegment = (segment: RichContentSegment, index: number, textStyle: TextStyle = ENRICHED_TEXT_STYLE) => {
    switch (segment.type) {
      case RichContentSegmentType.HTML:
        return (
          <EnrichedText key={index} style={textStyle} htmlStyle={ENRICHED_TEXT_HTML_STYLE} onLinkPress={onLinkPress}>
            {segment.html}
          </EnrichedText>
        );
      case RichContentSegmentType.IMAGE:
        return <ImagePreview key={index} src={segment.src} declaredSize={segment.declaredSize} onPress={onOpenMedia} />;
      case RichContentSegmentType.LATEX:
        return <LatexContent key={index} latex={segment.latex} />;
      case RichContentSegmentType.PANE:
        return (
          <Pane key={index} type={segment.paneType}>
            {segment.segments.map((childSegment, childIndex) => renderSegment(childSegment, childIndex, textStyle))}
          </Pane>
        );
      case RichContentSegmentType.TABLE:
        return <Table key={index} segment={segment} renderCellContent={renderCellContent} />;
      case RichContentSegmentType.ATTACHMENTS:
        return segment.items.map(attachment => (
          <AttachmentPreview key={`${index}-${attachment.href}`} attachment={attachment} onPress={onOpenMedia} />
        ));
      default:
        return <MediaPreview key={index} segment={segment} onOpenMedia={onOpenMedia} onOpenLink={onOpenLink} />;
    }
  };

  const renderCellContent = (cellSegments: RichContentSegment[], isHeader: boolean) =>
    cellSegments.map((cellSegment, cellIndex) =>
      renderSegment(cellSegment, cellIndex, isHeader ? ENRICHED_TEXT_HEADER_STYLE : ENRICHED_TEXT_STYLE),
    );

  return <View style={styles.container}>{segments.map((segment, index) => renderSegment(segment, index))}</View>;
};

export default React.memo(RichEditorNativeViewer);
