import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Toast from 'react-native-tiny-toast';

import { TouchCardWithoutPadding } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { TextBold } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { FavoriteIcon, IconButton } from '~/modules/mediacentre/components/SmallCard';
import { IResource, Source } from '~/modules/mediacentre/utils/Resource';

import { ResourceImage } from './ResourceImage';

const styles = StyleSheet.create({
  mainContainer: {
    marginBottom: 15,
  },
  titleText: {
    marginLeft: 10,
  },
  cardListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 10,
  },
  cardSlideContainer: {
    width: 145,
    height: 150,
    padding: 10,
  },
  cardContainer: {
    width: 125,
  },
  contentContainer: {
    marginLeft: 12,
    padding: 10,
    backgroundColor: 'white',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  cardTitleText: {
    alignSelf: 'center',
  },
  imageContainer: {
    width: 90,
    height: 60,
    alignSelf: 'center',
    marginVertical: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
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
  onDisplayAll: () => void;
  removeFavorite: (id: string, source: Source) => any;
}

const getCardColors = (length: number): string[] => {
  const colors = ['#4bafd5', '#46bfaf', '#ecbe30', '#e13a3a', '#b930a2', '#763294', '#1a22a2'];
  const cardColors: string[] = [];

  for (let index = 0; index < length; index += 1) {
    cardColors.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  return cardColors;
};

const Card: React.FunctionComponent<ICardProps> = (props: ICardProps) => {
  const openURL = () => {
    openUrl(props.resource.link);
  };
  const copyToClipboard = () => {
    Clipboard.setString(props.resource.link);
    Toast.show(I18n.t('mediacentre.link-copied'));
  };
  return (
    <TouchCardWithoutPadding onPress={openURL} style={[styles.cardContainer, { backgroundColor: props.color }]}>
      <View style={styles.contentContainer}>
        <TextBold numberOfLines={1} style={styles.cardTitleText}>
          {props.resource.title}
        </TextBold>
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
  }, [props.resources.length]);
  return (
    <View style={styles.mainContainer}>
      <TextBold style={styles.titleText}>{I18n.t('mediacentre.favorites').toUpperCase()}</TextBold>
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
