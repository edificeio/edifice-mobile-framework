import * as React from 'react';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { CarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/components/home-widget';
import { addHomeWidget } from '~/framework/modules/widgets/home-section';
import { timelineWidgets } from '~/framework/util/timelineWorkflows';

import moduleConfig from './module-config';

const isVisible = (session: AuthActiveAccount) =>
  timelineWidgets
    .get()
    .filterAvailables(session)
    .some(module => module.config.name === moduleConfig.name);

export default function setUpCarnetDeBordHomeWidget() {
  addHomeWidget({
    displayOrder: 100,
    isVisible,
    name: 'carnet-de-bord',
    renderComponent: session => React.createElement(CarnetDeBordWidget, { session }),
  });
}
