import * as React from 'react';
import { ImageURISource, View } from 'react-native';

import styled from '@emotion/native';
import Carousel from 'react-native-snap-carousel';

import Avatar, { Size } from './Avatar';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { CaptionText } from '~/framework/components/text';

const SkippedContainer = styled.View({
  alignItems: 'center',
  backgroundColor: theme.ui.background.card,
  borderRadius: 15,
  height: 29,
  justifyContent: 'center',
  marginLeft: -UI_SIZES.spacing.tiny,
  width: 29,
});

export interface IAvatarsProps {
  images: (
    | string
    | ImageURISource
    | {
        id: string;
        isGroup: boolean;
      }
  )[];
  onSlideIndex?: (index: number) => void;
  size?: Size;
}

export interface IAvatarsState {
  size?: {
    height: number;
    width: number;
  };
  slideIndex: number;
}

export class RowAvatars extends React.Component<IAvatarsProps, IAvatarsState> {
  public state = {
    size: {
      height: 0,
      width: 0,
    },
    slideIndex: 0,
  };

  private renderItem({ index, item }) {
    return (
      <Slide>
        <Avatar size={Size.verylarge} index={index} sourceOrId={item} />
      </Slide>
    );
  }

  private onSnapToItem(slideIndex) {
    this.props.onSlideIndex && this.props.onSlideIndex(slideIndex);
    this.setState({ slideIndex });
  }

  public render() {
    const { images, size = Size.verylarge } = this.props;
    const { height, width } = UI_SIZES.screen;

    let skipped = 0;
    if (images.length > 4 && size !== Size.verylarge) {
      skipped = images.length - 3;
      images.length = 3;
    }

    if (size === Size.verylarge) {
      return (
        <Container>
          <Carousel
            activeSlideAlignment="center"
            data={images}
            enableMomentum
            inactiveSlideOpacity={0.7}
            inactiveSlideScale={0.97}
            itemHeight={80}
            itemWidth={100}
            onSnapToItem={index => this.onSnapToItem(index)}
            removeClippedSubviews={false}
            renderItem={e => this.renderItem(e)}
            sliderHeight={80}
            sliderWidth={width}
          />
        </Container>
      );
    }

    return (
      <Container>
        {images.map((image, idx) => (
          <Avatar size={Size.aligned} key={idx} index={idx} count={images.length} sourceOrId={image} />
        ))}
        {skipped ? (
          <SkippedContainer>
            <CaptionText style={{ color: theme.palette.status.warning.regular, textAlign: 'center' }}>+{skipped}</CaptionText>
          </SkippedContainer>
        ) : (
          <View />
        )}
      </Container>
    );
  }
}

const Container = styled.View({
  alignItems: 'center',
  flex: 1,
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'center',
});

const Slide = styled.View({
  alignItems: 'center',
  height: 80,
  width: 100,
});
