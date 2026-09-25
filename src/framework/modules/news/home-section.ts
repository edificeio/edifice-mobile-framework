import * as React from 'react';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { registerHomeSection } from '~/framework/modules/home/registry';
import { NewsHomeSection } from '~/framework/modules/news/components/home-section';

import { getNewsRights } from './rights';

const hasNews = (session: AuthActiveAccount) => getNewsRights(session).view;

// Sets up the home section for news articles.
export default function setUpNewsHomeSection() {
  registerHomeSection({
    displayOrder: 100,
    isVisible: hasNews,
    name: 'news',
    renderComponent: session => React.createElement(NewsHomeSection, { session }),
  });
}
