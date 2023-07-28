import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { HeadingXSText } from '~/framework/components/text';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserStructuresScreenPrivateProps } from './types';
import { View } from 'react-native';
import { ButtonLineIconGroup, LineIconButton } from '~/framework/components/buttons/lineIcon';
import { NamedSVG } from '~/framework/components/picture';
import { UI_SIZES } from '~/framework/components/constants';
import theme from '~/app/theme';

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
  const sectionsData = React.useMemo(() => {
    const data = [] as {
      id: string;
      name: string;
      data: string[];
    }[];
    if (route.params.structures)
      for (const school of route.params.structures) {
        data.push({
          id: school.id,
          name: school.name,
          data: school.classes,
        });
      }
    return data;
  }, [route.params.structures]);
  return (
    <PageView style={styles.page}>
      {sectionsData.map(section => (
        <View style={styles.section}>
          <View style={styles.title}>
            <NamedSVG
              name="ui-school"
              width={UI_SIZES.elements.icon}
              height={UI_SIZES.elements.icon}
              fill={theme.palette.grey.black}
              style={styles.titleIcon}
            />
            <HeadingXSText>{section.name}</HeadingXSText>
          </View>
          <ButtonLineIconGroup>
            {section.data.map(school => (
              <LineIconButton icon="ui-class" text={school} />
            ))}
          </ButtonLineIconGroup>
        </View>
      ))}
    </PageView>
  );
};

export default UserStructuresScreen;
