import { StackActions } from '@react-navigation/native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/blog/module-config';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { jumpToModuleHome } from '~/framework/modules/myapps/navigation/actions';

// The home of the blog is reached first, so the back button leads to it rather than out of the
// module. The actions are dispatched one at a time, each screen showing before the next arrives.
export const dispatchBlogPostOnSuccessAction = (blogId: string, session: AuthActiveAccount) => [
  ...jumpToModuleHome(moduleConfig.name, session, blogRouteNames.blogExplorer),
  StackActions.push(blogRouteNames.blogPostList, { blogId, forceReload: true }),
];
