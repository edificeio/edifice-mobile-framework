import styled from '@emotion/native';
import * as React from 'react';
import { ImageProps, ImageURISource, View, ViewStyle } from 'react-native';
import RNFastImage from 'react-native-fast-image';

import theme from '~/app/theme';
import { openCarousel } from '~/framework/components/carousel/openCarousel';
import { UI_SIZES, getScaleImageSize } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallInverseText } from '~/framework/components/text';
import { FastImage } from '~/framework/util/media';
import { urlSigner } from '~/infra/oauth';

import TouchableOpacity from './CustomTouchableOpacity';
import { Row } from './Grid';
import ImageOptional from './ImageOptional';

const ContainerImage = styled.View({});

const SoloImage = styled(TouchableOpacity)({
  backgroundColor: theme.palette.grey.pearl,
  width: '100%',
});

const QuarterImage = styled(TouchableOpacity)({
  backgroundColor: theme.palette.grey.pearl,
  width: '100%',
});

const Overlay = styled(TouchableOpacity)({
  backgroundColor: theme.palette.grey.black,
  opacity: 0.6,
  bottom: 0,
  position: 'absolute',
  right: 0,
  width: '100%',
  borderRadius: UI_SIZES.radius.small,
});

const Column = styled.View({
  justifyContent: 'space-between',
  width: '50%',
});

const BubbleView = styled.View({
  backgroundColor: theme.palette.grey.black,
  opacity: 0.8,
  borderRadius: 15,
  height: 30,
  left: '50%',
  marginLeft: -UI_SIZES.spacing.small,
  padding: UI_SIZES.spacing.tiny,
  position: 'absolute',
  width: 30,
});

/*const StretchImage = style.image({
  height: "100%",
  width: "100%"
});*/

const imageWidth = getScaleImageSize(UI_SIZES.dimensions.height.huge);
const imageHeight = getScaleImageSize(UI_SIZES.dimensions.height.huge);

const UnavailableImage = (props: { big?: boolean }) => (
  <View
    style={{
      backgroundColor: theme.palette.grey.pearl,
      height: '100%',
      paddingHorizontal: UI_SIZES.spacing.minor,
      paddingVertical: UI_SIZES.spacing.minor,
      width: '100%',
      flex: 1,
      justifyContent: 'space-around',
      borderRadius: UI_SIZES.radius.small,
    }}>
    <NamedSVG
      style={{ alignSelf: 'center', flex: 0, marginVertical: UI_SIZES.spacing.minor }}
      name={'image-not-found'}
      width={(props.big ? 4 : 2) * imageWidth}
      height={(props.big ? 4 : 2) * imageHeight}
      fill={theme.palette.grey.stone}
    />
  </View>
);

const StretchImage = (props: ImageProps & { big?: boolean }) => {
  const { big, ...otherProps } = props;
  return (
    <ImageOptional
      {...otherProps}
      imageComponent={FastImage}
      errorComponent={<UnavailableImage big={big} />}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: UI_SIZES.radius.small,
      }}
      resizeMode={RNFastImage.resizeMode.cover}
    />
  );
};

class Images extends React.Component<
  {
    images: { src: ImageURISource; alt?: string; linkTo?: string }[];
    style?: ViewStyle;
  },
  any
> {
  public openImage(startIndex: any) {
    const { images } = this.props;
    const data = images.map(img => ({
      type: 'image' as 'image',
      src: img.src,
      ...(img.alt ? { alt: img.alt } : undefined),
      ...(img.linkTo ? { link: img.linkTo } : undefined),
    }));
    openCarousel({ data, startIndex });
  }

  public images() {
    const { images } = this.props;
    const scale = UI_SIZES.screen.scale;
    const width = UI_SIZES.screen.width;
    const heightRatio = width * 0.6;
    const getThumbnailWidth = (isFullWidth?: boolean) => {
      const pixelWidth = isFullWidth ? width * scale : (width * scale) / 2;
      const breakpoints = [750, 1080, 1440];
      return breakpoints.find(b => pixelWidth < b) || breakpoints[breakpoints.length - 1];
    };
    const getImageSource = (imageSrc: ImageURISource, removeThumbnail?: boolean) => {
      if (!imageSrc || !imageSrc.uri) return imageSrc;
      const uri = new URL(urlSigner.getAbsoluteUrl(imageSrc.uri)!);
      if (removeThumbnail) {
        uri.searchParams.delete('thumbnail');
      }
      return { ...imageSrc, uri: uri.toString() };
    };

    if (images.length === 0) return <View />;
    if (images.length === 1) {
      return (
        <SoloImage style={{ height: heightRatio }} onPress={() => this.openImage(0)}>
          <StretchImage source={getImageSource(images[0].src)} big />
        </SoloImage>
      );
    }
    if (images.length === 2) {
      return (
        <Row style={{ justifyContent: 'space-between' }}>
          <Column style={{ paddingRight: UI_SIZES.spacing._LEGACY_tiny }}>
            <SoloImage style={{ height: heightRatio }} onPress={() => this.openImage(0)}>
              <StretchImage source={getImageSource(images[0].src)} big />
            </SoloImage>
          </Column>
          <Column style={{ paddingLeft: UI_SIZES.spacing._LEGACY_tiny }}>
            <SoloImage style={{ height: heightRatio }} onPress={() => this.openImage(1)}>
              <StretchImage source={getImageSource(images[1].src)} big />
            </SoloImage>
          </Column>
        </Row>
      );
    }
    if (images.length === 3) {
      return (
        <Row style={{ justifyContent: 'space-between' }}>
          <Column style={{ paddingRight: UI_SIZES.spacing._LEGACY_tiny }}>
            <SoloImage style={{ height: heightRatio }} onPress={() => this.openImage(0)}>
              <StretchImage source={getImageSource(images[0].src)} />
            </SoloImage>
          </Column>
          <Column style={{ paddingLeft: UI_SIZES.spacing._LEGACY_tiny }}>
            <QuarterImage style={{ height: heightRatio / 2 - UI_SIZES.spacing._LEGACY_tiny }} onPress={() => this.openImage(1)}>
              <StretchImage source={getImageSource(images[1].src)} />
            </QuarterImage>
            <QuarterImage style={{ height: heightRatio / 2 - UI_SIZES.spacing._LEGACY_tiny }} onPress={() => this.openImage(2)}>
              <StretchImage source={getImageSource(images[2].src)} />
            </QuarterImage>
          </Column>
        </Row>
      );
    }
    if (images.length >= 4) {
      return (
        <Row style={{ justifyContent: 'space-between' }}>
          <Column style={{ paddingRight: UI_SIZES.spacing._LEGACY_tiny }}>
            <QuarterImage style={{ height: heightRatio / 2 - UI_SIZES.spacing._LEGACY_tiny }} onPress={() => this.openImage(0)}>
              <StretchImage source={getImageSource(images[0].src)} />
            </QuarterImage>
            <QuarterImage style={{ height: heightRatio / 2 - UI_SIZES.spacing._LEGACY_tiny }} onPress={() => this.openImage(2)}>
              <StretchImage source={getImageSource(images[2].src)} />
            </QuarterImage>
          </Column>
          <Column style={{ paddingLeft: UI_SIZES.spacing._LEGACY_tiny }}>
            <QuarterImage style={{ height: heightRatio / 2 - UI_SIZES.spacing._LEGACY_tiny }} onPress={() => this.openImage(1)}>
              <StretchImage source={getImageSource(images[1].src)} />
            </QuarterImage>
            <QuarterImage style={{ height: heightRatio / 2 - UI_SIZES.spacing._LEGACY_tiny }} onPress={() => this.openImage(3)}>
              <StretchImage source={getImageSource(images[3].src)} />
              {images.length > 4 && <Overlay style={{ height: heightRatio / 2 - 2 }} onPress={() => this.openImage(3)} />}
              {images.length > 4 && (
                <BubbleView style={{ bottom: heightRatio / 4 - 15, justifyContent: 'center' }}>
                  <SmallInverseText
                    style={{ marginHorizontal: -UI_SIZES.spacing.small, textAlign: 'center', lineHeight: undefined }}
                    onPress={() => this.openImage(3)}>
                    +
                    {
                      images.length - 3
                      /* -3 instead of -4 because of the last one has the dark foreground*/
                    }
                  </SmallInverseText>
                </BubbleView>
              )}
            </QuarterImage>
          </Column>
        </Row>
      );
    }
  }

  public render() {
    const { images, style } = this.props;
    const width = UI_SIZES.screen.width;
    const heightRatio = width * 0.6;

    if (images.length === 0) return <View />;
    return (
      <View style={style}>
        <ContainerImage style={{ height: heightRatio }}>{this.images()}</ContainerImage>
      </View>
    );
  }
}

// const withWindowDimensions = (Component) => {
//   return (props) => {
//     return <Component {...props} windowDimensions={useWindowDimensions()} />;
//   }
// }

export default /*withWindowDimensions*/ Images;
