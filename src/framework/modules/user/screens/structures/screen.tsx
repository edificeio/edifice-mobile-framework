import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { ContainerView } from '~/framework/components/buttons/line';
import { PageView } from '~/framework/components/page';
import SectionList from '~/framework/components/sectionList';
import { NestedText, SmallText } from '~/framework/components/text';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserStructuresScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.structures>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('directory-structuresTitle'),
  }),
});

function UserStructuresScreen(props: UserStructuresScreenPrivateProps) {
  const sectionsData = React.useMemo(() => {
    const data = [] as {
      id: string;
      name: string;
      data: string[];
    }[];
    if (props.structures)
      for (const school of props.structures) {
        data.push({
          id: school.id,
          name: school.name,
          data: school.classes,
        });
      }
    return data;
  }, [props.structures]);
  return (
    <PageView>
      <SectionList
        sections={sectionsData}
        renderSectionHeader={({ section }) => (
          <ContainerView>
            <SmallText style={styles.sectionTitle}>{section.name}</SmallText>
          </ContainerView>
        )}
        renderItem={({ item: classe }) => (
          <SmallText style={styles.itemTitle}>
            <NestedText style={styles.itemBullet}>◆ </NestedText>
            {classe}
          </SmallText>
        )}
        ListHeaderComponent={<SmallText style={styles.listHeader}>{I18n.t('structuresTitle')}</SmallText>}
        stickySectionHeadersEnabled={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      />
    </PageView>
  );
}

export default connect((state: IGlobalState) => {
  return {
    structures: getAuthState(state).session?.user.structures,
  };
})(UserStructuresScreen);
