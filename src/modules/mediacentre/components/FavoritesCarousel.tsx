import Clipboard from '@react-native-clipboard/clipboard';
import I18n from 'i18n-js';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import { TouchCard } from '~/framework/components/card';
import { Text, TextBold } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { getAuthHeader } from '~/infra/oauth';
import { FavoriteIcon, IconButton } from '~/modules/mediacentre/components/SmallCard';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

const styles = StyleSheet.create({
  mainContainer: {
    marginBottom: 15,
  },
  categoryHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  displayText: {
    color: theme.color.secondary.regular,
    textDecorationLine: 'underline',
  },
  carouselContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 10,
  },
  chevronButtonContainer: {
    width: 24,
  },
  cardContainer: {
    width: '35%',
    overflow: 'hidden',
  },
  coloredContainer: {
    width: 10,
    height: '200%',
    position: 'absolute',
  },
  contentContainer: {
    left: 5,
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

interface CardProps {
  color: string;
  resource: Resource;

  addFavorite: (id: string, resource: Resource) => any;
  removeFavorite: (id: string, source: Source) => any;
}

interface FavoritesCarouselProps {
  resources: Resource[];

  addFavorite: (id: string, resource: Resource) => any;
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

export const getImageUri = (value: string): string => {
  if (value.startsWith('/')) {
    const url = DEPRECATED_getCurrentPlatform()!.url;
    return url + value;
  }
  return value;
};

const Card: React.FunctionComponent<CardProps> = (props: CardProps) => {
  const openURL = () => {
    openUrl(props.resource.link);
  };
  const copyToClipboard = () => {
    Clipboard.setString(props.resource.link);
    Toast.show(I18n.t('mediacentre.link-copied'));
  };
  return (
    <TouchCard onPress={openURL} style={styles.cardContainer}>
      <View style={[styles.coloredContainer, { backgroundColor: props.color }]} />
      <View style={styles.contentContainer}>
        <TextBold numberOfLines={1}>{props.resource.title}</TextBold>
        <Image
          source={{ headers: getAuthHeader(), uri: getImageUri(props.resource.image) }}
          style={styles.imageContainer}
          resizeMode="contain"
        />
        <View style={styles.actionsContainer}>
          <FavoriteIcon {...props} />
          <IconButton icon="link" size={20} onPress={copyToClipboard} />
        </View>
      </View>
    </TouchCard>
  );
};

export const FavoritesCarousel: React.FunctionComponent<FavoritesCarouselProps> = (props: FavoritesCarouselProps) => {
  const [index, setIndex] = useState<number>(0);
  const [cardColors, setCardColors] = useState<string[]>(getCardColors(props.resources.length));
  const decreaseIndex = () => {
    setIndex(index - 1);
  };
  const increaseIndex = () => {
    setIndex(index + 1);
  };
  useEffect(() => {
    setIndex(0);
    if (props.resources.length > cardColors.length) {
      const difference = props.resources.length - cardColors.length;
      const colors = cardColors.concat(getCardColors(difference));
      setCardColors(colors);
    }
  }, [props.resources.length]);
  return (
    <View style={styles.mainContainer}>
      <View style={styles.categoryHeaderContainer}>
        <TextBold>{I18n.t('mediacentre.favorites').toUpperCase()}</TextBold>
        <TouchableOpacity onPress={props.onDisplayAll}>
          <Text style={styles.displayText}>{I18n.t('mediacentre.display-all')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.carouselContainer}>
        <View style={styles.chevronButtonContainer}>
          {index > 0 ? <IconButton icon="chevron-left" size={24} color="black" onPress={decreaseIndex} /> : null}
        </View>
        {props.resources.slice(index, index + 2).map((item, idx) => {
          return <Card {...props} resource={item} color={cardColors[index + idx]} key={item.uid || item.id} />;
        })}
        <View style={styles.chevronButtonContainer}>
          {index + 2 < props.resources.length ? (
            <IconButton icon="chevron-right" size={24} color="black" onPress={increaseIndex} />
          ) : null}
        </View>
      </View>
    </View>
  );
};
