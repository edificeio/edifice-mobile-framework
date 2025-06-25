import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { StyleSheet, Text, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import Swiper from 'react-native-swiper';

import { I18n } from '~/app/i18n';
import { getScaleFontSize, getScaleWidth } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import BtnNBK from '~/framework/modules/nabook/components/BtnNBK';
import { NBK_COLORS } from '~/framework/modules/nabook/utils/constants';
import textStyle from '~/framework/modules/nabook/utils/textStyle';

interface OnboardScreenProps {
  next: () => void;
}

const styles = StyleSheet.create({
  activeDot: {
    aspectRatio: 1,
    backgroundColor: NBK_COLORS.premiumColor,
    borderRadius: 100,
    width: getScaleWidth(20),
  },
  containerSlide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dot: {
    aspectRatio: 1,
    backgroundColor: NBK_COLORS.lightColor,
    borderRadius: 100,
    width: getScaleWidth(20),
  },
  img: {
    aspectRatio: 1,
    height: getScaleWidth(90),
    marginBottom: getScaleWidth(20),
  },
  paginationStyle: {
    alignItems: 'flex-start',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0, // getScaleWidth(10),
  },
  shadowContainerModal: {
    backgroundColor: NBK_COLORS.premiumColor,
    borderRadius: getScaleWidth(8),
    marginLeft: getScaleWidth(12),
    paddingBottom: getScaleWidth(12),
    paddingRight: getScaleWidth(12),
  },
  viewModal: {
    alignItems: 'center',
    backgroundColor: NBK_COLORS.lightColor,
    borderRadius: getScaleWidth(8),
    justifyContent: 'center',
    marginLeft: getScaleWidth(-12),
    marginTop: getScaleWidth(-12),
    padding: getScaleWidth(24),
  },
});

const Slide = (props: { index: number; data: { title: string; description: string; img: number } }) => {
  const { data } = props;
  return (
    <View style={styles.containerSlide}>
      <View style={styles.shadowContainerModal}>
        <View style={styles.viewModal}>
          <FastImage source={data.img} style={styles.img} />
          <Text style={[textStyle.title, { fontSize: getScaleFontSize(20), marginBottom: getScaleWidth(12) }]}>{data.title}</Text>
          <Text style={[textStyle.bodyRoboto, { fontSize: getScaleFontSize(14) }]}>{data.description}</Text>
        </View>
      </View>
    </View>
  );
};

export default function OnboardScreen(props: OnboardScreenProps) {
  const { next } = props;
  const swiperRef = React.useRef<Swiper | null>(null);

  // Je voulais le stocker à l'exterieur de la fonction mais I18n ne charge pas les textes
  // C'est pas ouf à modifier à l'occasion
  const DATA_ONBOARDING = [
    {
      description: I18n.get('nabook-onboarding-p1-desc'),
      img: require('ASSETS/images/nabook/onboarding/nabook-maestro.png'),
      title: I18n.get('nabook-onboarding-p1-title'),
    },
    {
      description: I18n.get('nabook-onboarding-p2-desc'),
      img: require('ASSETS/images/nabook/onboarding/nabook-schtroumpf.png'),
      title: I18n.get('nabook-onboarding-p2-title'),
    },
    {
      description: I18n.get('nabook-onboarding-p3-desc'),
      img: require('ASSETS/images/nabook/onboarding/nabook-charlotte.png'),
      title: I18n.get('nabook-onboarding-p3-title'),
    },
  ];

  return (
    <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
      <Swiper
        ref={swiperRef}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.paginationStyle}
        loop={false}>
        {DATA_ONBOARDING.map((d, index) => (
          <Slide key={index} index={index} data={d} />
        ))}
      </Swiper>
      <BtnNBK
        txt={I18n.get('nabook-btn-suivant')}
        clicked={() => {
          if (swiperRef)
            if (swiperRef.current?.state.index === DATA_ONBOARDING.length - 1) next();
            else swiperRef.current?.scrollBy(1);
        }}
      />
    </PageView>
  );
}
