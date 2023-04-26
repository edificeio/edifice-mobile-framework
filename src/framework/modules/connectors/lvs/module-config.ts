import theme from '~/app/theme';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasConnectorApp(entcoreApp: IEntcoreApp): boolean {
  const regex = /la[- ]+vie[- ]+scolaire/i;
  return entcoreApp.address.toUpperCase().includes('LVS') || regex.test(entcoreApp.address);
}

export default new NavigableModuleConfig<'lvs', null>({
  name: 'lvs',
  entcoreScope: ['lvs'],
  matchEntcoreApp: entcoreApp => hasConnectorApp(entcoreApp),

  displayI18n: 'lvs.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Icon', name: 'lvs', color: theme.palette.primary.regular },
});
