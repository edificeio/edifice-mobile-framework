import * as React from 'react';
import { View } from 'react-native';

import type { PostDetailsProps } from './types';

import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import Audience from '~/framework/modules/audience/components';
import { MediaGrid } from '~/framework/util/media/components/grid';

const PostDetails = React.memo((props: Readonly<PostDetailsProps<number>>) => {
  const { audience, content, header, media, style } = props;

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={content} />;
  }, [content]);

  return (
    <View style={style}>
      {header}
      {richContent}
      <MediaGrid media={media} />
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
