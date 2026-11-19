import { EntModule } from '~/app/module';

import reducer from './reducer';
import supportCreateTicketScreen from './screens/create-ticket';

export default new EntModule({
  entries: {
    myApps: { route: 'support' },
  },
  entTrackingName: 'Support',
  fileManager: {
    attachments: {
      allow: ['image', 'video', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  } as const,
  matchEntcoreApp: 'Aide et support',
  name: 'support',
  redux: { reducer },
  scope: ['support'],
  screens: {
    support: supportCreateTicketScreen,
  },
});
