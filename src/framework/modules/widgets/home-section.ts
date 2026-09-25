import * as React from 'react';

import { registerHomeSection } from '~/framework/modules/home/registry';
import { WidgetsHomeSection } from '~/framework/modules/widgets/components/home-section';
import { hasVisibleHomeWidgets, registerHomeWidget } from '~/framework/modules/widgets/registry';
import type { RegistryEntry } from '~/framework/util/registry';

registerHomeSection({
  displayOrder: 200,
  isVisible: hasVisibleHomeWidgets,
  name: 'widgets',
  renderComponent: session => React.createElement(WidgetsHomeSection, { session }),
});

// adds a widget to the section the home page shows them in.
export function addHomeWidget(widget: RegistryEntry) {
  return registerHomeWidget(widget);
}
