import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

import type reducer from './reducers';

export default new NavigableModuleConfig<'homework', ReturnType<typeof reducer>>({
  displayAs: () => (theme.level === '1D' ? ModuleType.TAB_MODULE : undefined),
  displayOrder: 2,
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
  testID: 'tabbar-homework',
});
