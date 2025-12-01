//
// See https://docs.infinite.red/reactotron/quick-start/react-native for more details
//
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactotronReactNative } from 'reactotron-react-native';
import Reactotron from 'reactotron-react-native';
import mmkvPlugin from 'reactotron-react-native-mmkv';
import { reactotronRedux } from 'reactotron-redux';

import { mmkvInstance as storage } from '~/framework/util/storage/mmkv';

export default Reactotron.configure({})
  .setAsyncStorageHandler(AsyncStorage)
  .use(reactotronRedux())
  .use(mmkvPlugin<ReactotronReactNative>({ storage }))
  .useReactNative({ asyncStorage: true })
  .connect();
