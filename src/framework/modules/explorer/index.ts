/**
 * Explorer module: the folders and resources of the apps (`/explorer/resources`), kept by app in its own store, and the template
 * that shows them (`templates/resource-explorer`), used by the screens of other modules. No screen of its own.
 */
import { CoreModule } from '~/app/module';

import reducer from './store';

export default new CoreModule({
  name: 'explorer',
  redux: { reducer },
  scope: ['explorer'],
});
