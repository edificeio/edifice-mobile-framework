/**
 * Audience module
 * Loads the valid reaction types of the platform of the account each time a session starts (see `store.ts`).
 * No screen yet.
 */

import { CoreModule } from '~/app/module';
import { audienceService } from '~/framework/modules/audience/service';

import { usePlatformReactionTypesStore } from './store';

export default new CoreModule({
  name: 'audience',

  // Failures are only logged: it must not prevent the use of the app
  onSessionStart: session => {
    audienceService.reaction
      .getValidReactionTypes()
      .then(types => usePlatformReactionTypesStore.getState().setReactionTypes(session.platform.name, types['reaction-types']))
      .catch(e => console.warn('[Audience] Unable to load valid reaction types:', e));
  },
});
