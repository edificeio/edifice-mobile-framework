import type reducer from './reducers';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homework', ReturnType<typeof reducer>>({
  displayAs: ModuleType.MYAPPS_MODULE,
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
