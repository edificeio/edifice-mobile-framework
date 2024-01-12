import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { ISession } from '~/framework/modules/auth/model';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog } from '~/framework/modules/blog/reducer';
import { SyncedFile } from '~/framework/util/fileHandler';

export interface BlogCreatePostScreenDataProps {
  session?: ISession;
}

export interface BlogCreatePostScreenEventProps {
  handleSendBlogPost(blog: Blog, title: string, content: string, uploadedPostImages?: SyncedFile[]): Promise<string | undefined>;
  handleInitTimeline(): Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}

export interface BlogCreatePostScreenNavParams {
  blog: Blog;
  referrer?: string;
}

export type BlogCreatePostScreenProps = BlogCreatePostScreenDataProps &
  BlogCreatePostScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogCreatePost>;
