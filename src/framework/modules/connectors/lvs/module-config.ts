import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const LVSRegex = /la[- ]+vie[- ]+scolaire/i;
const LVSTestString = 'LVS';
function hasConnectorApp(entcoreApp: IEntcoreApp): boolean {
  return entcoreApp.address.toUpperCase().includes(LVSTestString) || LVSRegex.test(entcoreApp.address);
}

const LVS = 'lvs';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  entcoreScope: [LVS],
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => hasConnectorApp(entcoreApp)),
  matchEntcoreApp: 'Lvs',
  name: LVS,
  storageName: LVS,
});
