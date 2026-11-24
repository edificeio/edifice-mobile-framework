/**
 * Comments of a resource, with their replies: the template a module puts on the screen of its resource
 * (`ResourceWithCommentsTemplate`), and the modal that shows a comment with all its replies (`comments/reply`).
 */
import { CoreModule } from '~/app/module';

import commentsReplyModal from './screens/reply';

export default new CoreModule({
  modals: {
    'comments/reply': commentsReplyModal,
  },
  name: 'comments',
});

/**
 * custom config for the module
 * ToDo: externalize this in overrides/platforms
 */
export const config = {
  maxLength: 800,
};

export * from './templates/resource-with-comments';
