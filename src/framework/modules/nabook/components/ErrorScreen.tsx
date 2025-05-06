/* eslint-disable no-restricted-imports */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BtnNBK from './BtnNBK';

import { getScaleHeight, getScaleWidth } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { NBK_COLORS } from '~/framework/modules/nabook/utils/constants';
import textStyle from '~/framework/modules/nabook/utils/textStyle';

export interface ErrorScreenProps {
  msg: string | null;
  getBack: () => void;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: getScaleWidth(20),
  },
  errorTextContainer: {
    backgroundColor: NBK_COLORS.mediumColor,
    borderRadius: 8,
    marginVertical: getScaleHeight(30),
    padding: getScaleWidth(20),
  },
});

const ErrorScreen = (props: ErrorScreenProps) => {
  const { getBack, msg } = props;

  return (
    <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
      <View style={styles.container}>
        <Text style={textStyle.bodyRoboto}>L'application Nabook n'a pas pu être chargée</Text>
        <View style={styles.errorTextContainer}>
          <Text style={textStyle.bodyRoboto}>{msg || 'Erreur inconnue'}</Text>
        </View>
        <BtnNBK txt="Retour" clicked={getBack} />
      </View>
    </PageView>
  );
};

export default ErrorScreen;
