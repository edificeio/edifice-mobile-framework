import * as React from 'react';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { CantineWidget } from '~/framework/modules/widgets/cantine/components/home-widget';
import { addHomeWidget } from '~/framework/modules/widgets/home-section';
import { isModuleAvailable } from '~/framework/util/moduleTool';
import { timelineWidgets } from '~/framework/util/timelineWorkflows';

import moduleConfig from './module-config';

const isVisible = (session: AuthActiveAccount) =>
  timelineWidgets.get().some(module => module.config.name === moduleConfig.name && isModuleAvailable(module, session));

export default function setUpCantineHomeWidget() {
  addHomeWidget({
    displayOrder: 200,
    isVisible,
    name: 'cantine',
    renderComponent: session => React.createElement(CantineWidget, { session }),
  });
}
