import * as React from 'react';
import { View } from 'react-native';

import type { PostDetailsProps } from './types';

import GridMediaCard from '~/framework/components/card/media/grid';
import SingleMediaCard from '~/framework/components/card/media/single';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import Audience from '~/framework/modules/audience/components';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';
import { MediaGrid } from '~/framework/util/media/components/grid';

const PostDetails = React.memo((props: Readonly<PostDetailsProps<number>>) => {
  const { audience, content, header, media, resourceId, style } = props;
  // const hasMedia = media && media.length > 0;
  // const attachmentsFiles = hasMedia && media[0].type === 'attachment';

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={content} />;
  }, [content]);

  // const renderAttachments = React.useCallback(() => {
  //   if (!hasMedia || !attachmentsFiles) return null;

  //   if (media.length === 1) {
  //     return <SingleMediaCard media={media[0]} />;
  //   }

  //   return <GridMediaCard media={media} />;
  // }, [hasMedia, attachmentsFiles, media]);

  return (
    <View style={style}>
      {header}
      {richContent}
      <MediaGrid media={media} />
      {/*{hasMedia && !attachmentsFiles
        ? renderMediaPreview(media, { module: 'communities', resourceId, resourceType: 'announcement' })
        : null}
      {renderAttachments()}*/}
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
