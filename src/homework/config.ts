import deviceInfoModule from 'react-native-device-info';

import theme from '~/app/theme';
import FunctionalModuleConfig from '~/infra/moduleTool';

// tslint:disable:object-literal-sort-keys

// Yeah, it's ugly. Sorry. We must port this module into frameworkV2 to make this happier.
console.log('deviceInfoModule.getBundleId()', deviceInfoModule.getBundleId());
const isAppOne = deviceInfoModule.getBundleId() === 'com.ode.one';
export const fillName = theme.palette.complementary[isAppOne ? 'blue' : 'green'].regular;

export default new FunctionalModuleConfig({
  name: 'homework',
  apiName: 'Cahier de texte',
  displayName: 'Homework',
  picture: { type: 'NamedSvg', name: 'homework1D', fill: fillName },
  group: true,
  notifHandlerFactory: async () => {
    //must lazy load to avoid compile errors
    const res = await import('./notifHandler');
    const val: any = res.default;
    //sometime dynamic import include default in default
    if (val.default) {
      return val.default;
    } else {
      return val;
    }
  },
});
