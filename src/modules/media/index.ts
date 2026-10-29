/**
 * Media module
 * Shows the medias (images, videos, audios, pdf...) the user opens: the carousel is the viewer of the app, and the reader of pdf.
 * It also holds what any module that shows medias needs: the model (`types`, `mime`, `util`), the components (`Image`, `FastImage`,
 * `Video`, `Pdf`, `MediaGrid`), which sign their sources by themselves (see `source.ts`), and the hooks (`useOpenMedia`...).
 * To open medias, use `useOpenMedia`.
 */

import { CoreModule } from '~/app/module';

import MediaCarouselScreen from './screens/carousel/screen';
import MediaDownloadScreen from './screens/download/screen';
import { mediaStorage } from './storage';

export default new CoreModule({
  modals: {
    'media/carousel': MediaCarouselScreen,
    'media/download': MediaDownloadScreen,
  },
  name: 'media',
  storages: [mediaStorage],
});
