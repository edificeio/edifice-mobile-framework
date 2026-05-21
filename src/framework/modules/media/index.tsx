import React from 'react';

import { Action } from 'redux';

import { CoreModule } from '~/app/module';
import MultimediaCarousel, { MultimediaCarouselScreenOptions } from '~/framework/components/carousel-multimedia/';
import { MultimediaCarouselNavParams } from '~/framework/components/carousel-multimedia/openCarousel';
import DownloadModal, { DownloadModalScreenOptions } from '~/framework/components/modals/download/component';
import { DownloadModalNavParams } from '~/framework/components/modals/download/types';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';

export default new CoreModule<
  'media',
  {
    'media/carousel': MultimediaCarouselNavParams;
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
      <Stack.Screen name="media/carousel" component={MultimediaCarousel} options={MultimediaCarouselScreenOptions} />
      <Stack.Screen name="media/download" component={DownloadModal} options={DownloadModalScreenOptions} />
    </>
  ),
);

setModalModeForRoutes(['media/carousel']);
