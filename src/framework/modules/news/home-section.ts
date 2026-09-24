import * as React from 'react';

import { registerHomeSection } from '~/framework/modules/home/registry';
import { hasNews, NewsHomeSection } from '~/framework/modules/news/components/home-section';

// Sets up the home section for news articles.
export default function setUpNewsHomeSection() {
  registerHomeSection({
    displayOrder: 100,
    isVisible: hasNews,
    name: 'news',
    renderComponent: session => React.createElement(NewsHomeSection, { session }),
  });
}
