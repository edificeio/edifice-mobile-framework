import React from 'react';

import { Action } from 'redux';

import { RootModule } from '~/app/module';
import MultimediaCarousel, { MultimediaCarouselScreenOptions } from '~/framework/components/carousel-multimedia/';
import { MultimediaCarouselNavParams } from '~/framework/components/carousel-multimedia/openCarousel';

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
