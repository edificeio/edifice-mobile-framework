/**
 * Audience module
 * Reactions and views of the resources of other modules: the `Audience` bar (`components/`), its two modals of details and the
 * reaction picker. Loads the valid reaction types of the platform of the account each time a session starts (see `store.ts`).
 */

import { CoreModule } from '~/app/module';

import { loadPlatformReactionTypes } from './actions';
import audienceReactModal from './screens/react';
import audienceReactionsModal from './screens/reactions';
import audienceViewsModal from './screens/views';

export default new CoreModule({
  modals: {
    'audience/react': audienceReactModal,
    'audience/reactions': audienceReactionsModal,
    'audience/views': audienceViewsModal,
  },
  name: 'audience',
  // Failures are only logged: it must not prevent the use of the app
  onSessionStart: session => {
    loadPlatformReactionTypes(session).catch(e => console.warn('[Audience] Unable to load valid reaction types:', e));
  },

  scope: ['audience'],
});
