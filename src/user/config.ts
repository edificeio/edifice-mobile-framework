import FunctionalModuleConfig from '~/infra/moduleTool';

// tslint:disable:object-literal-sort-keys

const isXmasThemeOn = true;
export default new FunctionalModuleConfig({
  name: 'user',
  displayName: 'MyAccount',
  iconName: `${isXmasThemeOn ? 'xmas-' : ''}profile`,
});
