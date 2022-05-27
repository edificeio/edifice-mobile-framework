import React from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleProp, StyleSheet } from 'react-native';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { getAuthHeader } from '~/infra/oauth';
import { Source } from '~/modules/mediacentre/utils/Resource';

const styles = StyleSheet.create({
  sourceImageContainer: {
    alignSelf: 'flex-end',
  },
});

interface ResourceImageProps {
  image: string;
  resizeMode?: ImageResizeMode;
  style?: StyleProp<ImageStyle>;
}

interface SourceImageProps {
  size: number;
  source: string;
}

const getImageUri = (value: string): string => {
  if (value.startsWith('/')) {
    const url = DEPRECATED_getCurrentPlatform()!.url;
    return url + value;
  }
  return value;
};

export const ResourceImage: React.FunctionComponent<ResourceImageProps> = (props: ResourceImageProps) => {
  return (
    <Image source={{ headers: getAuthHeader(), uri: getImageUri(props.image) }} style={props.style} resizeMode={props.resizeMode} />
  );
};

export const SourceImage: React.FunctionComponent<SourceImageProps> = (props: SourceImageProps) => {
  let image;
  switch (props.source) {
    case Source.GAR:
      image = require('ASSETS/images/logo-gar.png');
      break;
    case Source.MOODLE:
      image = require('ASSETS/images/logo-moodle.png');
      break;
    case Source.PMB:
      image = require('ASSETS/images/logo-pmb.png');
      break;
    default:
      image = require('ASSETS/images/logo-gar.png');
      break;
  }
  return (
    <Image source={image} style={[styles.sourceImageContainer, { height: props.size, width: props.size }]} resizeMode="contain" />
  );
};
