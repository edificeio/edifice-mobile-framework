import { rozeniteDevToolsEnhancer } from '@rozenite/redux-devtools-plugin';

import reactotron from '../reactotron';

export const reactotronEnhancer = reactotron.createEnhancer();

/** The store in the Redux tab of React Native DevTools, with Rozenite (`WITH_ROZENITE=true yarn start`). */
export const rozeniteEnhancer = rozeniteDevToolsEnhancer({ name: 'app' });
