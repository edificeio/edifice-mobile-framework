import React from 'react';

import PostDetails from './component';
import { AnnouncementDetailsCardProps, BlogPostDetailsProps } from './types';

export const BlogPostDetailsCard = React.memo((props: BlogPostDetailsProps) => {
  return <PostDetails {...props} />;
});

export const AnnouncementPostDetailsCard = React.memo((props: AnnouncementDetailsCardProps) => {
  return <PostDetails {...props} />;
});

export default PostDetails;
