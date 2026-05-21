import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'pronote-connector', null>({
  entcoreScope: ['pronote'],
  hasRight: ({ session }) => session.rights.apps.some(entcoreApp => entcoreApp.casType === 'PronoteRegisteredService'),
  matchEntcoreApp: 'Pronote',
  name: 'pronote-connector',
  storageName: 'pronote-connector',
});
