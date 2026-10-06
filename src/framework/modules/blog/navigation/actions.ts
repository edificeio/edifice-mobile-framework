import { CommonActions, StackActions, TabActions } from '@react-navigation/native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/blog/module-config';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import { getHomeTarget } from '~/framework/navigation/homeTarget';
import { getModuleTabRouteName } from '~/framework/navigation/tabTarget';

export const backToHome = () => CommonActions.navigate(getHomeTarget().screen, { forceReload: true }, { pop: true });

// a tab jump only builds the home of the tab, then the target screen; we add a second action so
// that the home of the blog sits between the two, and the back button leads to it.
export const goToBlogPosts = (blogId: string, session: AuthActiveAccount) => [
  TabActions.jumpTo(getModuleTabRouteName(moduleConfig.name, session), {
    initial: false,
    screen: blogRouteNames.blogExplorer,
  }),
  StackActions.push(blogRouteNames.blogPostList, { blogId, forceReload: true }),
];
