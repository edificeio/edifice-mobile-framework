import type reducer from './reducers';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homework', ReturnType<typeof reducer>>({
  displayPictureBlur: { name: 'diary-outline', type: 'Svg' },
  displayPictureFocus: { name: 'diary-fill', type: 'Svg' },
  entcoreScope: ['homeworks'],
  entcoreTrackingName: 'Homeworks',
  fileManager: {
    attachments: {
      allow: ['image'],
      multiple: true,
      sources: ['camera', 'gallery'],
    },
  } as const,
  matchEntcoreApp: 'Cahier de texte',
  name: 'homework',
  storageName: 'homework',
});
