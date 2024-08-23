import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { BadgeAvatar, BadgePosition } from '~/framework/components/badgeAvatar';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, CaptionBoldText, SmallText } from '~/framework/components/text';
import { ContentLoader } from '~/framework/hooks/loader';
import { getValidReactionTypes } from '~/framework/modules/auth/reducer';
import { audienceService } from '~/framework/modules/core/audience/service';
import { AudienceReactions, AudienceUserReaction } from '~/framework/modules/core/audience/types';
import { audienceReactionsInfos } from '~/framework/modules/core/audience/util';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import { AudienceReactionsScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.AudienceReactions>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('audience-reactions-title'),
  }),
});

const AudienceReactionsScreen = (props: AudienceReactionsScreenProps) => {
  const { module, resourceId, resourceType } = props.route.params.referer;

  const [userReactions, setUserReactions] = React.useState<AudienceUserReaction[]>([]);
  const [countByType, setCountByType] = React.useState<Record<string, number>>();
  //const [allReactionsCounter, setAllReactionsCounter] = React.useState<number>(0);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const dt = (await audienceService.reaction.getDetails(
        {
          module,
          resourceType,
          resourceId,
        },
        1,
        20,
      )) as AudienceReactions;
      setUserReactions(dt.userReactions);
      //setAllReactionsCounter(dt.reactionCounters.allReactionsCounter);
      setCountByType(dt.reactionCounters.countByType);
    } catch (e) {
      console.log('[AudienceReactionsScreen] error :', e);
    }
  }, [module, resourceId, resourceType]);

  const resetFilter = () => {
    if (selectedItem === null) return;
    setUserReactions(userReactions);
    setSelectedItem(null);
  };
  const filterByType = (reactionType: string) => {
    if (selectedItem === reactionType) return;
    setUserReactions(userReactions.filter(reaction => reaction.reactionType === reactionType));
    setSelectedItem(reactionType);
  };

  const renderHeaderItem = ({ item }: { item: { icon: string; nb: number; type: string } }) => {
    return (
      <>
        <View style={styles.separator} />
        <TouchableOpacity
          style={[styles.headerItem, selectedItem === item.type ? styles.headerSelectedItem : null]}
          onPress={() => filterByType(item.type)}>
          <NamedSVG name={item.icon} />
          <SmallText>{item.nb}</SmallText>
        </TouchableOpacity>
      </>
    );
  };
  const renderHeaderList = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={resetFilter}>
          <SmallText>{I18n.get('audience-reactions-all')}</SmallText>
        </TouchableOpacity>
        {props.validReactionTypes.map(reactionType =>
          renderHeaderItem({
            item: { icon: reactionType.toLowerCase(), nb: countByType![reactionType] ?? 0, type: reactionType },
          }),
        )}
      </View>
    );
  };
  const renderContent = () => {
    return (
      <PageView style={styles.container}>
        <FlatList
          ListHeaderComponent={renderHeaderList}
          data={userReactions}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <BadgeAvatar
                userId={item.userId}
                badgeContent={item.reactionType.toLowerCase()}
                badgeColor={audienceReactionsInfos[item.reactionType].color}
                badgePosition={BadgePosition.bottom}
              />
              <View>
                <BodyText>{item.displayName}</BodyText>
                <CaptionBoldText>{I18n.get(`user-profiletypes-${item.profile.toLowerCase()}`)}</CaptionBoldText>
              </View>
            </View>
          )}
        />
      </PageView>
    );
  };
  return <ContentLoader loadContent={loadData} renderContent={renderContent} renderError={() => <EmptyContentScreen />} />;
};

export default connect(
  state => {
    return {
      validReactionTypes: getValidReactionTypes(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => () => ({
    dispatch,
  }),
)(AudienceReactionsScreen);
