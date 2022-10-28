import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import SectionList from '~/framework/components/sectionList';
import { SmallText } from '~/framework/components/text';

import { UserCard } from './UserCard';

// TYPES ------------------------------------------------------------------------------------------

export interface IChildrenPageProps {
  schools: {
    structureName: string;
    children: {
      displayName: string;
      id: string;
    }[];
  }[];
}

// COMPONENT --------------------------------------------------------------------------------------

export class ChildrenPage extends React.PureComponent<IChildrenPageProps & NavigationInjectedProps<NavigationState>> {
  render() {
    interface ISectionListItem {
      structureName: string;
      data: {
        displayName: string;
        id: string;
      }[];
    }
    const data = [] as ISectionListItem[];
    if (this.props.schools)
      for (const school of this.props.schools) {
        data.push({
          structureName: school.structureName,
          data: school.children,
        });
      }

    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('directory-childrenTitle'),
        }}>
        {this.props.schools ? (
          <SectionList
            alwaysBounceVertical={false}
            overScrollMode="never"
            sections={data}
            keyExtractor={item => item.id}
            renderSectionHeader={({ section }) => {
              return (
                <SmallText style={{ marginTop: UI_SIZES.spacing.big, paddingHorizontal: UI_SIZES.spacing.medium }}>
                  {section.structureName}
                </SmallText>
              );
            }}
            renderItem={({ item: user }) => {
              return (
                <View style={{ marginBottom: UI_SIZES.spacing.medium }} key={user.id}>
                  <UserCard id={user.id} displayName={user.displayName} type="Student" />
                </View>
              );
            }}
          />
        ) : null}
      </PageView>
    );
  }
}
