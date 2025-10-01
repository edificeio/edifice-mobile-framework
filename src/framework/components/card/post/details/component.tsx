import * as React from 'react';
import { View } from 'react-native';

import type { PostProps } from './types';

import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import Audience from '~/framework/modules/audience/components';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';

const PostDetails = React.memo((props: PostProps) => {
  const { audience, content, header, media, resourceId, style } = props;
  const hasMedia = media && media.length > 0;

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={content} /*onLoad={onReady}*/ />;
  }, [content]);

  return (
    <View style={style}>
      {header}
      {richContent}
      {hasMedia ? renderMediaPreview(media, { module: 'communities', resourceId, resourceType: 'announcement' }) : null}
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
