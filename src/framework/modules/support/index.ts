import { EntModule } from '~/app/module';

import supportCreateTicketScreen from './screens/create-ticket';

export default new EntModule({
  entries: {
    myApps: { route: 'support/create-ticket' },
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
  scope: ['support'],
  screens: {
    'support/create-ticket': supportCreateTicketScreen,
  },
});
