import React from 'react';

import PostResourceCard from './component';
import type { AnnouncementPostResourceCardProps, BlogPostResourceCardProps } from './types';

// Wrapper Blog Posts
export const BlogPostResourceCard = React.memo((props: BlogPostResourceCardProps) => {
  return <PostResourceCard {...props} />;
});

// Wrapper Community Announcements
export const AnnouncementPostResourceCard = React.memo((props: AnnouncementPostResourceCardProps) => {
  return <PostResourceCard {...props} />;
});

export default PostResourceCard;
