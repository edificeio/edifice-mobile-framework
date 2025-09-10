import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import Carousel from 'react-native-snap-carousel';

import { ResourceImage } from './ResourceImage';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { TouchCardWithoutPadding } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { FavoriteIcon, IconButton } from '~/framework/modules/mediacentre/components/SmallCard';
import { IResource, Source } from '~/framework/modules/mediacentre/reducer';
import { openResource } from '~/framework/modules/mediacentre/service';

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  cardContainer: {
    width: 125,
  },
  cardListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: UI_SIZES.spacing.small,
  },
  cardSlideContainer: {
    height: 154,
    padding: UI_SIZES.spacing.small,
    width: 149,
  },
  cardTitleText: {
    alignSelf: 'center',
  },
  contentContainer: {
    backgroundColor: theme.ui.background.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderTopRightRadius: UI_SIZES.radius.card,
    marginLeft: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.minor,
  },
  imageContainer: {
    alignSelf: 'center',
    height: 60,
    marginVertical: UI_SIZES.spacing.tiny,
    width: 90,
  },
  mainContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  titleText: {
    marginLeft: UI_SIZES.spacing.small,
  },
});

interface ICardProps {
  color: string;
  resource: IResource;

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface IFavoritesCarouselProps {
  resources: IResource[];

  addFavorite: (id: string, resource: IResource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

const getCardColors = (length: number): string[] => {
  const colors = [
    theme.palette.status.info.regular,
    theme.palette.complementary.green.regular,
    theme.palette.complementary.yellow.regular,
    theme.palette.complementary.red.regular,
    theme.palette.complementary.pink.regular,
    theme.palette.complementary.purple.regular,
    theme.palette.complementary.indigo.regular,
  ];
  const cardColors: string[] = [];

  for (let index = 0; index < length; index += 1) {
    cardColors.push(colors[Math.floor(Math.random() * colors.length)] as string);
  }
  return cardColors;
};

const Card: React.FunctionComponent<ICardProps> = (props: ICardProps) => {
  const openUrlCallback = () => {
    openResource(props.resource);
  };
  const copyToClipboard = () => {
    Clipboard.setString(props.resource.link);
    Toast.showInfo(I18n.get('mediacentre-home-linkcopied'));
  };
  return (
    <TouchCardWithoutPadding onPress={openUrlCallback} style={[styles.cardContainer, { backgroundColor: props.color }]}>
      <View style={styles.contentContainer}>
        <SmallBoldText numberOfLines={1} style={styles.cardTitleText}>
          {props.resource.title}
        </SmallBoldText>
        <ResourceImage image={props.resource.image} style={styles.imageContainer} resizeMode="contain" />
        <View style={styles.actionsContainer}>
          <FavoriteIcon {...props} />
          <IconButton icon="link" size={20} onPress={copyToClipboard} />
        </View>
      </View>
    </TouchCardWithoutPadding>
  );
};

export const FavoritesCarousel: React.FunctionComponent<IFavoritesCarouselProps> = (props: IFavoritesCarouselProps) => {
  const [cardColors, setCardColors] = useState<string[]>(getCardColors(props.resources.length));
  const { width } = UI_SIZES.screen;
  const renderFavorite = ({ index, item }) => {
    return (
      <View style={styles.cardSlideContainer}>
        <Card {...props} resource={item} color={cardColors[index % cardColors.length]} key={item.uid || item.id} />
      </View>
    );
  };
  useEffect(() => {
    if (props.resources.length > cardColors.length) {
      const difference = props.resources.length - cardColors.length;
      const colors = cardColors.concat(getCardColors(difference));
      setCardColors(colors);
    }
  }, [props.resources.length, cardColors]);
  return (
    <View style={styles.mainContainer}>
      <SmallBoldText style={styles.titleText}>{I18n.get('mediacentre-home-section-favorites').toUpperCase()}</SmallBoldText>
      {props.resources.length > 2 ? (
        <Carousel
          data={props.resources}
          renderItem={renderFavorite}
          itemWidth={styles.cardSlideContainer.width}
          sliderWidth={width}
          itemHeight={styles.cardSlideContainer.height}
          sliderHeight={styles.cardSlideContainer.height}
          inactiveSlideOpacity={1}
          enableMomentum
          loop
        />
      ) : (
        <View style={styles.cardListContainer}>
          {props.resources.map((item, index) => {
            return <Card {...props} resource={item} color={cardColors[index]} key={item.uid || item.id} />;
          })}
        </View>
      )}
    </View>
  );
};
