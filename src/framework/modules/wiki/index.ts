import { EntModule } from '~/app/module';

import { intents } from './intents';
import wikiExplorerScreen from './screens/explorer';
import wikiPagesModal from './screens/pages';
import wikiReaderScreen from './screens/reader';
import wikiSummaryScreen from './screens/summary';
import reducer from './store';

export default new EntModule({
  entries: {
    myApps: { route: 'wiki/explorer' },
  },
  entTrackingName: 'Wiki',
  intents,
  matchEntcoreApp: 'Wiki',
  modals: {
    'wiki/pages': wikiPagesModal,
  },
  name: 'wiki',
  redux: { reducer },
  scope: ['wiki', 'userbook'],
  screens: {
    'wiki/explorer': wikiExplorerScreen,
    'wiki/reader': wikiReaderScreen,
    'wiki/summary': wikiSummaryScreen,
  },
});
