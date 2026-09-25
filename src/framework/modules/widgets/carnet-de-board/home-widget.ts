import * as React from 'react';

import { CarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/components/home-widget';
import { canSeeCarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/rights';
import { addHomeWidget } from '~/framework/modules/widgets/home-section';

export default function setUpCarnetDeBordHomeWidget() {
  addHomeWidget({
    displayOrder: 100,
    isVisible: canSeeCarnetDeBordWidget,
    name: 'carnet-de-bord',
    renderComponent: session => React.createElement(CarnetDeBordWidget, { session }),
  });
}
