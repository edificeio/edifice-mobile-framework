/**
 * New implementation of Carousel built with react-native-reanimated-carousel !
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { ImageURISource, StatusBar, StyleSheet, Text } from 'react-native';
import RNCarousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { IMedia } from '~/framework/util/media';

export interface ICarouselNavParams {
  data: IMedia[];
  startIndex?: number;
}

export interface ICarouselProps extends NavigationInjectedProps<ICarouselNavParams> {}

function getItemKey({ item, index }: { item: IMedia; index: number }) {
  return typeof (item.src === 'string' ? item.src : (item.src as ImageURISource).uri) ?? index;
}

const styles = StyleSheet.create({
  page: { backgroundColor: theme.palette.grey.black },
});

function renderCarouselItem({ item, index }: { item: IMedia; index: number }) {
  return (
    <Text style={{ textAlign: 'center', fontSize: 12 }}>
      {index}
      {JSON.stringify(item)}
    </Text>
  );
}

const carouselModeConfig = {};

/** This is a pure HACK 🍔
 * NavigationParams make the component to crash.
 * We must pass the data another way
 */
// export const cachedData = {current: undefined};
export function openCarousel(props: ICarouselNavParams, navigation: any) {
  // cachedData.current = JSON.parse(JSON.stringify(props.data));
  // cachedData.current = props.data;
  navigation.navigate('carouselModal2', props);
};

export function Carousel(props: ICarouselProps) {
  const { navigation } = props;
  const startIndex = navigation.getParam('startIndex') ?? 0;
  const data = navigation.getParam('data') ?? []; // See big hack of the death
  // const carouselRef = React.useRef<ICarouselInstance>();

  return (
    <PageView navigation={navigation} style={styles.page}>
      <StatusBar backgroundColor={theme.palette.grey.black} barStyle="light-content" />
      <RNCarousel
        // Layout
        mode='parallax'
        modeConfig={carouselModeConfig}
        width={UI_SIZES.screen.width}
        height={UI_SIZES.screen.height}
        // Data
        data={data}
        renderItem={renderCarouselItem}
        defaultIndex={startIndex}
        // Control
        // ref={carouselRef}
        loop
      />
    </PageView>
  );
}

export default Carousel;