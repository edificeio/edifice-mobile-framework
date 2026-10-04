import * as React from 'react';

import { addHomeWidget } from '~/framework/modules/widgets/home-section';
import { ScreenTimeWidget } from '~/framework/modules/widgets/screen-time/components/home-widget';
import { canSeeScreenTimeWidget } from '~/framework/modules/widgets/screen-time/rights';

export default function setUpScreenTimeHomeWidget() {
  addHomeWidget({
    displayOrder: 300,
    isVisible: canSeeScreenTimeWidget,
    name: 'screen-time',
    renderComponent: session => React.createElement(ScreenTimeWidget, { session }),
  });
}
