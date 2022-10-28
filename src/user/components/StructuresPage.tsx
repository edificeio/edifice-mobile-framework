import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import SectionList from '~/framework/components/sectionList';
import { NestedText, SmallText } from '~/framework/components/text';
import { ContainerView } from '~/ui/ButtonLine';

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
                <SmallText style={{ color: theme.ui.text.light }}>{section.name}</SmallText>
              </ContainerView>
            )}
            renderItem={({ item: classe }) => (
              <SmallText
                style={{
                  marginLeft: UI_SIZES.spacing.medium,
                  marginRight: UI_SIZES.spacing.medium,
                  marginVertical: UI_SIZES.spacing.small,
                }}>
                <NestedText style={{ color: theme.palette.complementary.orange.regular }}>◆ </NestedText>
                {classe}
              </SmallText>
            )}
            ListHeaderComponent={
              <SmallText style={{ marginTop: UI_SIZES.spacing.big, paddingHorizontal: UI_SIZES.spacing.medium }}>
                {I18n.t('structuresTitle')}
              </SmallText>
            }
            stickySectionHeadersEnabled={false}
            alwaysBounceVertical={false}
            overScrollMode="never"
          />
        ) : null}
      </PageView>
    );
  }
}
