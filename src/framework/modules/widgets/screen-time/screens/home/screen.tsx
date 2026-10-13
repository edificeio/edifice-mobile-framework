import * as React from 'react';
import { FlatList, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import BottomSheetModal, { type BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import ScrollView from '~/framework/components/scrollView';
import { BodyText } from '~/framework/components/text';
import UserList from '~/framework/components/UserList';
import { withSession } from '~/framework/modules/auth/util';
import { useSelectedChild } from '~/framework/modules/widgets/hooks';
import { useScreenTimeUsers } from '~/framework/modules/widgets/screen-time/hooks/screen-time';
import { ScreenTimeNavigationParams, screenTimeRouteNames } from '~/framework/modules/widgets/screen-time/navigation';
import { selectedChildStorage } from '~/framework/modules/widgets/screen-time/storage';
import { navBarOptions } from '~/framework/navigation/navBar';

import { ChildScreenTime } from './child';
import styles from './styles';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ScreenTimeNavigationParams, typeof screenTimeRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('widget-screen-time-home-title'),
  }),
});

const ScreenTimeHomeScreen = withSession<{ embedded?: boolean; noScroll?: boolean }>(
  ({ embedded = false, noScroll = false, session }) => {
    const { bottom: bottomSafeArea } = useSafeAreaInsets();
    const infoSheetRef = React.useRef<BottomSheetModalMethods>(null);
    const childrenListRef = React.useRef<FlatList>(null);

    const userChildren = useScreenTimeUsers(session);
    const { select, selected } = useSelectedChild(userChildren, selectedChildStorage);

    const onInfoPress = React.useCallback(() => infoSheetRef.current?.present(), []);

    const selectedChildIndex = userChildren.findIndex(child => child.id === selected?.id);

    const scrollToSelectedChild = React.useCallback(() => {
      if (selectedChildIndex < 0) return;
      requestAnimationFrame(() => childrenListRef.current?.scrollToIndex({ index: selectedChildIndex, viewPosition: 0.5 }));
    }, [selectedChildIndex]);

    React.useEffect(scrollToSelectedChild, [scrollToSelectedChild]);

    const content = (
      <View style={styles.container}>
        {userChildren.length === 0 ? (
          <EmptyScreen svgImage="empty-search" title={I18n.get('widget-screen-time-empty-title')} />
        ) : (
          <View style={styles.contentContainer}>
            {userChildren.length > 1 && (
              <UserList
                ref={childrenListRef}
                horizontal
                data={userChildren}
                selectedId={selected?.id}
                onSelect={select}
                onContentSizeChange={scrollToSelectedChild}
                style={styles.users}
                contentContainerStyle={styles.usersContent}
                bottomInset={false}
              />
            )}
            {selected ? <ChildScreenTime key={selected.id} childId={selected.id} onInfoPress={onInfoPress} /> : null}
          </View>
        )}
      </View>
    );

    const infoSheet = (
      <BottomSheetModal ref={infoSheetRef} closeButton>
        <BodyText>{I18n.get('widget-screen-time-info-modal-text')}</BodyText>
      </BottomSheetModal>
    );

    if (embedded && noScroll)
      return (
        <>
          {content}
          {infoSheet}
        </>
      );

    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bottomInset={false}
          contentContainerStyle={{ paddingBottom: bottomSafeArea }}>
          {content}
        </ScrollView>
        {infoSheet}
      </>
    );
  },
);

export default ScreenTimeHomeScreen;
