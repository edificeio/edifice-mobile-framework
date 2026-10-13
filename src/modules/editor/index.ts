/**
 * Editor module
 * The rich text editor needs the oneSessionId (cookie) of the account: it is refreshed each time a session starts.
 * No screen yet.
 */

import { CoreModule } from '~/app/module';
import { refreshOneSessionId } from '~/modules/auth/flows';

export default new CoreModule({
  name: 'editor',

  // Failures are only logged: it must not prevent the use of the app
  onSessionStart: session => {
    refreshOneSessionId(session).catch(e => console.warn('[Editor] Unable to refresh the oneSessionId:', e));
  },
});
