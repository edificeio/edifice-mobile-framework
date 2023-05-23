import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import SectionList from '~/framework/components/sectionList';
import { SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import UserCard from '~/framework/modules/user/components/user-card';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { ChildrenDataByStructures, UserFamilyScreenPrivateProps } from '~/framework/modules/user/screens/family/types';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.family>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.mode === 'children' ? I18n.get('directory-childrenTitle') : I18n.get('directory-relativesTitle'),
  }),
});

function UserFamilyScreen(props: UserFamilyScreenPrivateProps) {
  const { childrenByStructures, relatives, route } = props;
  const mode = route.params.mode;
  const childrenDataByStructures = React.useMemo(() => {
    const data: ChildrenDataByStructures = [];
    if (childrenByStructures) {
      for (const childrenByStructure of childrenByStructures) {
        data.push({
          structureName: childrenByStructure.structureName,
          data: childrenByStructure.children,
        });
      }
    }
    return data;
  }, [childrenByStructures]);

  return (
    <PageView>
      {mode === 'children' && childrenByStructures ? (
        <SectionList
          alwaysBounceVertical={false}
          overScrollMode="never"
          stickySectionHeadersEnabled={false}
          sections={childrenDataByStructures}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section }) => {
            return <SmallText style={styles.structureName}>{section.structureName}</SmallText>;
          }}
          renderItem={({ item: user }) => {
            return (
              <View style={styles.child} key={user.id}>
                <UserCard id={user.id} displayName={user.displayName} type="Student" hasAvatar={false} canEdit={false} />
              </View>
            );
          }}
        />
      ) : mode === 'relatives' && relatives ? (
        <FlatList
          alwaysBounceVertical={false}
          overScrollMode="never"
          data={relatives}
          keyExtractor={item => item.id}
          renderItem={({ item: user }) => (
            <View style={styles.relative} key={user.id}>
              <UserCard id={user.id} displayName={user.displayName} type="Relative" hasAvatar={false} canEdit={false} />
            </View>
          )}
          ListFooterComponent={<View style={styles.relativesListFooter} />}
          contentContainerStyle={styles.relativesContentContainer}
        />
      ) : null}
    </PageView>
  );
}

export default connect((state: IGlobalState) => ({
  relatives: getSession()?.user?.relatives,
  childrenByStructures: getSession()?.user?.children,
}))(UserFamilyScreen);
