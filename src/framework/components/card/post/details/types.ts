import { ViewStyle } from 'react-native';

import { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { type Blog, type BlogPostWithAudience } from '~/framework/modules/blog/reducer';
import { DisplayedBlog } from '~/framework/modules/blog/screens/BlogExplorerScreen';

export interface PostWithAudienceProps extends AnnouncementProps {
  audience?: {
    reactions?: {
      total: number;
      types: string[];
      userReaction?: string;
    };
  };
}

interface AnnouncementProps {
  author: {
    userId: string;
    username: string;
  };
  content: string;
  created: Moment;
  firstPublishDate?: Moment;
  modified: Moment;
  title: string;
  _id: string;
}

export interface PostDetailsProps {
  borderBottomStyle?: ViewStyle;
  session: AuthActiveAccount;
  onReady?: () => void;
  post: BlogPostWithAudience | PostWithAudienceProps;
}

export interface BlogPostDetailsProps extends PostDetailsProps {
  blog: DisplayedBlog | Blog;
}

export interface AnnouncementDetailsCardProps extends PostDetailsProps {
  announcement: AnnouncementProps;
}
