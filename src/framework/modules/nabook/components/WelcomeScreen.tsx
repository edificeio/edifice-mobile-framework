import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { StyleSheet, Text, View } from 'react-native';

import FastImage from 'react-native-fast-image';

import { I18n } from '~/app/i18n';
import { getScaleWidth } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import BtnNBK from '~/framework/modules/nabook/components/BtnNBK';
import { NBK_COLORS } from '~/framework/modules/nabook/utils/constants';
import textStyle from '~/framework/modules/nabook/utils/textStyle';

const NBK_KV = require('ASSETS/images/nabook/nabook-key-visual.png');
const NBK_LOGO = require('ASSETS/images/nabook/nabook-logo-full.png');

interface WelcomeScreenProps {
  next: () => void;
}

const styles = StyleSheet.create({
  containerContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  containerKeyVisual: {
    bottom: -getScaleWidth(16),
    left: -getScaleWidth(16),
    position: 'absolute',
    right: -getScaleWidth(16),
    top: 0,
  },
  containerLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getScaleWidth(50),
    width: '100%',
  },
  keyVisual: {
    aspectRatio: 1570 / 600,
    bottom: -getScaleWidth(16),
    height: '55%',
    left: -getScaleWidth(16),
    position: 'absolute',
    right: -getScaleWidth(16),
  },
  logo: {
    aspectRatio: 205 / 66,
    height: getScaleWidth(66),
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: getScaleWidth(40),
    zIndex: 100,
  },
});

export default function WelcomeScreen(props: WelcomeScreenProps) {
  const { next } = props;
  return (
    <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
      <View style={styles.main}>
        <View style={styles.containerLogo}>
          <FastImage style={styles.logo} source={NBK_LOGO} />
        </View>
        <View style={styles.containerContent}>
          <Text style={textStyle.title}>{I18n.get('nabook-welcome-title')}</Text>
        </View>
        <BtnNBK txt={I18n.get('nabook-btn-decouvrir')} clicked={next} />
      </View>
      <View style={styles.containerKeyVisual}>
        <FastImage style={styles.keyVisual} resizeMode="cover" source={NBK_KV} />
      </View>
    </PageView>
  );
}
