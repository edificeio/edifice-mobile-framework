import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { HeadingXSText } from '~/framework/components/text';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserStructuresScreenPrivateProps } from './types';
import { ScrollView, View } from 'react-native';
import { NamedSVG } from '~/framework/components/picture';
import { UI_SIZES } from '~/framework/components/constants';
import theme from '~/app/theme';
import { isEmpty } from '~/framework/util/object';
import { ButtonLineGroup, LineButton } from '~/framework/components/buttons/line';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.structures>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-structures-title'),
  }),
});

const UserStructuresScreen = (props: UserStructuresScreenPrivateProps) => {
  const { route } = props;
  return (
    <PageView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {route.params.structures.map(structure => (
          <View style={styles.section}>
            <View style={styles.title}>
              <NamedSVG
                name="ui-school"
                width={UI_SIZES.elements.icon}
                height={UI_SIZES.elements.icon}
                fill={theme.palette.grey.black}
                style={styles.titleIcon}
              />
              <HeadingXSText>{structure.name}</HeadingXSText>
            </View>
            <ButtonLineGroup>
              {!isEmpty(structure.classes) ? (
                structure.classes.map(className => <LineButton icon="ui-class" title={className} />)
              ) : (
                <LineButton icon="ui-class" title={I18n.get('user-profile-classEmpty')} />
              )}
            </ButtonLineGroup>
          </View>
        ))}
      </ScrollView>
    </PageView>
  );
};

export default UserStructuresScreen;
