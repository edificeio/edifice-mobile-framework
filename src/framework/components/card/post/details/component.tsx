import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import type { PostDetailsProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { Svg } from '~/framework/components/picture/svg';
import { SmallBoldText } from '~/framework/components/text';
import Audience from '~/framework/modules/audience/components';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';
import { INotificationMedia } from '~/framework/util/notifications';

const attachmentStyles = StyleSheet.create({
  attachmentsContainer: {
    gap: UI_SIZES.spacing.small,
  },
  container: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.elements.border.thin,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
});

const Attachment = ({ media }: { media: INotificationMedia }) => {
  const openFile = () => {
    openPDFReader({
      src: media.src as string,
      title: media.name!!,
    });
  };

  return (
    <TouchableOpacity style={attachmentStyles.container} onPress={openFile}>
      <Svg
        name="ui-attachment"
        width={UI_SIZES.elements.icon.medium}
        height={UI_SIZES.elements.icon.medium}
        fill={theme.palette.grey.black}
      />
      <SmallBoldText>{media.name}</SmallBoldText>
    </TouchableOpacity>
  );
};

const PostDetails = React.memo((props: PostDetailsProps) => {
  const { audience, content, header, media, resourceId, style } = props;
  const hasMedia = media && media.length > 0;
  const pdfFiles = hasMedia && media[0].type === 'attachment';

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={content} /*onLoad={onReady}*/ />;
  }, [content]);

  const renderAttachment = (item: INotificationMedia, index: number) => {
    return <Attachment key={index} media={item} />;
  };

  return (
    <View style={style}>
      {header}
      {richContent}
      {hasMedia && !pdfFiles
        ? renderMediaPreview(media, { module: 'communities', resourceId, resourceType: 'announcement' })
        : null}
      {hasMedia && pdfFiles ? <View style={attachmentStyles.attachmentsContainer}>{media.map(renderAttachment)}</View> : null}
      {audience && (
        <Audience
          infosReactions={audience.infosReactions}
          referer={audience.referer}
          session={audience.session}
          showComments={false}
        />
      )}
    </View>
  );
});

export default PostDetails;
