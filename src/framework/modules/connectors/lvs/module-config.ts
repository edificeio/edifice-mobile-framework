import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

const LVSRegex = /la[- ]+vie[- ]+scolaire/i;
const LVSTestString = 'LVS';
function hasConnectorApp(entcoreApp: IEntcoreApp): boolean {
  return entcoreApp.address.toUpperCase().includes(LVSTestString) || LVSRegex.test(entcoreApp.address);
}

const LVS = 'lvs';

export default new NavigableModuleConfig<string, null>({
  displayAs: ModuleType.MYAPPS_CONNECTOR,
  displayI18n: 'lvs-moduleconfig-appname',
  displayPicture: { name: LVS, type: 'Svg' },
  entcoreScope: [LVS],
  matchEntcoreApp: entcoreApp => hasConnectorApp(entcoreApp),
  name: LVS,
  storageName: LVS,
});
