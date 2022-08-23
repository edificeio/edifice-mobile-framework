import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import FunctionalModuleConfig from '~/infra/moduleTool';

// tslint:disable:object-literal-sort-keys

export const fillName = theme.palette.complementary[appConf.is1d ? 'blue' : 'green'].regular;

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
