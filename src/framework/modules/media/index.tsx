import React from 'react';

import { Action } from 'redux';

import { RootModule } from '~/app/module';
import MultimediaCarousel, { MultimediaCarouselScreenOptions } from '~/framework/components/carousel-multimedia/';
import { MultimediaCarouselNavParams } from '~/framework/components/carousel-multimedia/openCarousel';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';

export default new RootModule<
  'media',
  {
    'media/carousel': MultimediaCarouselNavParams;
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
    </>
  ),
);

setModalModeForRoutes(['media/carousel']);
