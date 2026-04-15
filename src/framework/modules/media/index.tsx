import React from 'react';

import { RootModule } from '~/app/module';
import { Action } from 'redux';
import { MultimediaCarouselNavParams } from '~/framework/components/carousel-multimedia/openCarousel';
import MultimediaCarousel, { CarouselMultimediaNavBar } from '~/framework/components/carousel-multimedia/';

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
      <Stack.Screen name="media/carousel" component={MultimediaCarousel} options={CarouselMultimediaNavBar} />
    </>
  ),
);
