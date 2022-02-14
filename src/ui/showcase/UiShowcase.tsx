import * as React from 'react';
import { ScrollView, Text } from 'react-native';

import UiButtons from './UiButtons';
import UiContainers from './UiContainers';

import { PageContainer } from '~/ui/ContainerContent';

/**
 * Page container that show every UI component.
 */
export class UiShowCase extends React.Component {
  public render() {
    return (
      <PageContainer>
        <ScrollView>
          <UiButtons />
          <UiContainers />
          <Text>The end.</Text>
        </ScrollView>
      </PageContainer>
    );
  }
}
