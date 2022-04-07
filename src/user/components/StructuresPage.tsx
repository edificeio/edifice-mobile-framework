import I18n from 'i18n-js';
import * as React from 'react';
import { SectionList, View } from 'react-native';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NestedText, Text, TextColorStyle } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';
import { ContainerView } from '~/ui/ButtonLine';
import { H4 } from '~/ui/Typography';

// TYPES ------------------------------------------------------------------------------------------

export interface IStructuresPageProps {
  schools: {
    id: string;
    name: string;
    classes: string[];
  }[];
}

// COMPONENT --------------------------------------------------------------------------------------

export class StructuresPage extends React.PureComponent<IStructuresPageProps & NavigationInjectedProps<NavigationState>> {
  render() {
    const data = [] as {
      id: string;
      name: string;
      data: string[];
    }[];
    if (this.props.schools)
      for (const school of this.props.schools) {
        data.push({
          id: school.id,
          name: school.name,
          data: school.classes,
        });
      }

    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('directory-structuresTitle'),
        }}>
        {this.props.schools ? (
          <SectionList
            sections={data}
            renderSectionHeader={({ section }) => (
              <ContainerView>
                <Text style={{ ...TextColorStyle.Light }}>{section.name}</Text>
              </ContainerView>
            )}
            renderItem={({ item: classe }) => (
              <Text
                style={{
                  marginLeft: 40,
                  marginRight: 20,
                  marginVertical: 10,
                }}>
                <NestedText style={{ color: CommonStyles.profileTypes.Student }}>◆ </NestedText>
                {classe}
              </Text>
            )}
            ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
            ListHeaderComponent={<H4>{I18n.t('structuresTitle')}</H4>}
            stickySectionHeadersEnabled={false}
            alwaysBounceVertical={false}
            overScrollMode="never"
          />
        ) : null}
      </PageView>
    );
  }
}
