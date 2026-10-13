import * as React from 'react';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { addHomeWidget } from '~/framework/modules/widgets/home-section';
import { ScreenTimeWidget } from '~/framework/modules/widgets/screen-time/components/home-widget';
import { isModuleAvailable } from '~/framework/util/moduleTool';
import { timelineWidgets } from '~/framework/util/timelineWorkflows';

import moduleConfig from './module-config';

const isVisible = (session: AuthActiveAccount) =>
  timelineWidgets.get().some(module => module.config.name === moduleConfig.name && isModuleAvailable(module, session));

export default function setUpScreenTimeHomeWidget() {
  addHomeWidget({
    displayOrder: 300,
    isVisible,
    name: 'screen-time',
    renderComponent: session => React.createElement(ScreenTimeWidget, { session }),
  });
}
