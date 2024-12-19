import { ThunkDispatch } from 'redux-thunk';

import { getPublishableBlogListAction } from './actions';
import { blogRouteNames } from './navigation';
import { Blog } from './reducer';

import { I18n } from '~/app/i18n';
import { getStore } from '~/app/store';
import Toast from '~/framework/components/toast';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { registerTimelineWorkflow } from '~/framework/modules/timeline/timeline-modules';
import { navigate } from '~/framework/navigation/helper';
import { resourceHasRight } from '~/framework/util/resourceRights';

export const createBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|create';
export const submitBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|submit';
export const publishBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|publish';
export const commentBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|comment';
export const updateCommentBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|updateComment';
export const deleteCommentBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|deleteComment';

export const listBlogsResourceRight = 'org.entcore.blog.controllers.BlogController|list';
export const printBlogResourceRight = 'org.entcore.blog.controllers.BlogController|print';
export const viewBlogResourceRight = 'org.entcore.blog.controllers.BlogController|blog';
export const createBlogResourceRight = 'org.entcore.blog.controllers.BlogController|create';
export const createPublicBlogResourceRight = 'org.entcore.blog.controllers.BlogController|createPublicBlog';
export const publishBlogResourceRight = 'org.entcore.blog.controllers.BlogController|publish';
export const deleteBlogResourceRight = 'org-entcore-blog-controllers-BlogController|delete';

export const addBlogFolderResourceRight = 'org.entcore.blog.controllers.FoldersController|add';

export const getBlogPostRight = (blog: Blog, session: AuthLoggedAccount) => {
  const hasPublishRight = resourceHasRight(blog, publishBlogPostResourceRight, session);
  const hasSubmitRight = resourceHasRight(blog, submitBlogPostResourceRight, session);
  const hasCreateRight = resourceHasRight(blog, createBlogPostResourceRight, session);
  const isPublishTypeImmediate = blog['publish-type'] === 'IMMEDIATE';
  const isPublishTypeRestraint = blog['publish-type'] === 'RESTRAINT';

  if (hasPublishRight) {
    return { actionRight: publishBlogPostResourceRight, displayRight: publishBlogPostResourceRight };
  } else if (hasSubmitRight && isPublishTypeImmediate) {
    return { actionRight: submitBlogPostResourceRight, displayRight: publishBlogPostResourceRight };
  } else if (hasSubmitRight && isPublishTypeRestraint) {
    return { actionRight: submitBlogPostResourceRight, displayRight: submitBlogPostResourceRight };
  } else if (hasCreateRight) {
    return { actionRight: createBlogPostResourceRight, displayRight: createBlogPostResourceRight };
  } else return undefined;
};

export const hasPermissionManager = (blog: Blog, session: AuthLoggedAccount) => {
  return blog && (blog.author.userId === session.user.id || resourceHasRight(blog, deleteBlogResourceRight, session));
};

export const getBlogWorkflowInformation = (session: AuthLoggedAccount) => ({
  blog: {
    create: session.rights.authorizedActions.some(a => a.name === createBlogResourceRight),
    createPublic: session.rights.authorizedActions.some(a => a.name === createPublicBlogResourceRight),
    list: session.rights.authorizedActions.some(a => a.name === listBlogsResourceRight),
    print: session.rights.authorizedActions.some(a => a.name === printBlogResourceRight),
    publish: session.rights.authorizedActions.some(a => a.name === publishBlogResourceRight),
    view: session.rights.authorizedActions.some(a => a.name === viewBlogResourceRight),
  },
  folder: {
    add: session.rights.authorizedActions.some(a => a.name === addBlogFolderResourceRight),
  },
});

export default () =>
  registerTimelineWorkflow(session => {
    const wk = getBlogWorkflowInformation(session);
    return (
      wk.blog.create && {
        action: async () => {
          try {
            const blogsData = await (getStore().dispatch as ThunkDispatch<any, any, any>)(getPublishableBlogListAction());
            const hasOneBlog = blogsData?.length === 1;

            if (hasOneBlog) {
              navigate(blogRouteNames.blogCreatePost, { blog: blogsData[0] });
            } else navigate(blogRouteNames.home, { blogsData });
          } catch {
            Toast.showError(I18n.get('blog-rights-error-text'));
          }
        },
        title: I18n.get('blog-resourcename'),
      }
    );
  });
