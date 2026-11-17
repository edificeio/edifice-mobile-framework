import React from 'react';

import { Action } from 'redux';

import { CoreModule } from '~/app/module';
import Carousel, { CarouselScreenOptions } from '~/framework/components/carousel/';
import type { CarouselNavParams } from '~/framework/components/carousel/screen/types';
import DownloadModal, { DownloadModalScreenOptions } from '~/framework/components/modals/download/component';
import { DownloadModalNavParams } from '~/framework/components/modals/download/types';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';

export default new CoreModule<
  'media',
  {
    'media/carousel': CarouselNavParams;
    'media/download': DownloadModalNavParams;
  },
  {},
  Action
>(
  {
    name: 'media',
  },
  Stack => (
    <>
      <Stack.Screen name="media/carousel" component={Carousel} options={CarouselScreenOptions} />
      <Stack.Screen name="media/download" component={DownloadModal} options={DownloadModalScreenOptions} />
    </>
  ),
);

setModalModeForRoutes(['media/carousel', 'media/download']);

export * from './components';
export * from './hooks';
export * from './mime';
export * from './types';
export * from './util';

