/**
 * Button « create » of the home of `timeline`: it chooses a blog (only one: none to choose), then creates a post in it.
 */
import Toast from '~/framework/components/toast';
// ToDo(blog-migration): code of `timeline`, not loaded. This workflow is registered by nothing since the switch of `blog`. To take
// back with the switch of `timeline`, as an entry `create` dedicated to this feature (`entries.create`, ARCHITECTURE §2.3).
import { registerTimelineWorkflow } from '~/framework/modules/timeline/timeline-modules';
import { I18n } from '~/util/i18n';

import { loadPublishableBlogs } from './actions';
import { getBlogWorkflowInformation } from './model/business';

export default () =>
  registerTimelineWorkflow((session, navigation) => {
    const wk = getBlogWorkflowInformation(session);
    return (
      wk.blog.create && {
        action: async () => {
          try {
            const blogsData = await loadPublishableBlogs(session);
            const hasOneBlog = blogsData.length === 1;

            if (hasOneBlog) {
              navigation.navigate('blog/create-post', { blog: blogsData[0] });
            } else navigation.navigate('blog/select', { blogsData });
          } catch {
            Toast.showError(I18n.get('blog-rights-error-text'));
          }
        },
        title: I18n.get('blog-resourcename'),
      }
    );
  });
