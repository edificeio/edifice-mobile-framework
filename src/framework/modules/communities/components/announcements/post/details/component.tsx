import * as React from 'react';
import { View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import Audience from '~/framework/modules/audience/components';
import { ANNOUNCEMENT_AUDIENCE_REFERER } from '~/framework/modules/communities/service/announcements';
import { MediaGrid } from '~/framework/modules/media/components/grid';

import type { PostDetailsProps } from './types';

const PostDetails = React.memo((props: Readonly<PostDetailsProps<number>>) => {
  const { audience, content, header, media, resourceId, session, style } = props;

  const richContent = React.useMemo(() => {
    if (!content) return;
    return <RichEditorViewer content={content} />;
  }, [content]);

  const referer = React.useMemo(() => ({ ...ANNOUNCEMENT_AUDIENCE_REFERER, resourceId: resourceId.toString() }), [resourceId]);

  return (
    <View style={style}>
      {header}
      {richContent}
      <MediaGrid navigation={useNavigation()} media={media} />
      {audience && <Audience infosReactions={audience} referer={referer} session={session} showComments={false} />}
    </View>
  );
});

export default PostDetails;
