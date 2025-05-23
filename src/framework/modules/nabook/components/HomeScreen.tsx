import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getPlatform } from '../../auth/reducer';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import BtnNBK from '~/framework/modules/nabook/components/BtnNBK';
import { NBK_BASE_URL, NBK_COLORS, ONE_LINK_NBK } from '~/framework/modules/nabook/utils/constants';
import textStyle from '~/framework/modules/nabook/utils/textStyle';
import { signedFetchJson } from '~/infra/fetchWithCache';

export interface HomeScreenProps {
  token: {
    accessToken: string;
    profilId: number;
  };
}

const NBK_CASQUE = require('ASSETS/images/nabook/nabook-casque.png');

const styles = StyleSheet.create({
  backgroundLight: {
    backgroundColor: NBK_COLORS.lightColor,
    borderRadius: getScaleWidth(8),
    padding: getScaleWidth(28),
    width: '100%',
  },
  backgroundMedium: {
    backgroundColor: NBK_COLORS.mediumColor,
    borderRadius: getScaleWidth(8),
    marginBottom: getScaleWidth(20),
    padding: getScaleWidth(14),
  },
  casque: { aspectRatio: 1, height: getScaleWidth(100) },
  codeClasse: {
    marginBottom: getScaleWidth(16),
    marginTop: getScaleWidth(20),
  },
  codeClasseContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  containerCasque: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: getScaleWidth(-50),
    zIndex: getScaleWidth(100),
  },
  containerCode: { alignItems: 'center', flex: 3, flexGrow: 1, justifyContent: 'center', marginTop: getScaleWidth(70) },
  containerDivider: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: getScaleWidth(20),
    justifyContent: 'center',
    marginBottom: getScaleWidth(20),
    marginTop: getScaleWidth(20),
  },
  content: { fontSize: getScaleWidth(16), textAlign: 'center' },
  divider: { backgroundColor: NBK_COLORS.white, flex: 1, height: 3 },
  error: { color: NBK_COLORS.orange, marginBottom: getScaleWidth(16), marginTop: getScaleWidth(20) },
  or: {
    fontSize: getScaleWidth(14),
  },
  title: { fontSize: getScaleWidth(24), marginBottom: getScaleWidth(12) },
});

const HomeScreen = (props: HomeScreenProps) => {
  const { token } = props;

  const [codeClasse, setCodeClasse] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const r = (await signedFetchJson(`${getPlatform()?.url}/nabook/conf`)) as {
          nabookMobile?: string;
          nabookUrl?: string;
        };

        const res = await fetch(`${r.nabookMobile || NBK_BASE_URL}/main/edifice/code`, {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });
        if (res.status !== 200) {
          console.error('[🛑] Nabook | HomeScreen: Failed to load class code', token.accessToken);
          setError('Impossible de charger le code élève');
          setIsLoading(false);
          return;
        }
        const json = await res.json();
        if (!json || !json.code) {
          setError('Pas de code attribué');
          setIsLoading(false);
          return;
        }
        setError(null);
        setCodeClasse(json.code);
        setIsLoading(false);
      } catch (e) {
        console.error('[🛑] Nabook | HomeScreen: Error fetching class code:', e);
        setError('Erreur lors du chargement du code élève');
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  const openNabook = async () => {
    const supported = await Linking.canOpenURL(ONE_LINK_NBK);
    if (supported) await Linking.openURL(ONE_LINK_NBK);
  };

  const copyCode = async () => {
    if (codeClasse) {
      Clipboard.setString('codeClasse');
      Toast.showSuccess(I18n.get('nabook-homescreen-code-copied'));
    }
  };

  return (
    <PageView gutters="both" showNetworkBar={false} statusBar="none" style={{ backgroundColor: NBK_COLORS.darkColor }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[textStyle.title, styles.title]}>{I18n.get('nabook-homescreen-title')}</Text>
        <Text style={[textStyle.bodyRoboto, styles.content]}>{I18n.get('nabook-homescreen-content')}</Text>

        <View style={styles.containerCode}>
          <View style={styles.backgroundLight}>
            <View style={styles.containerCasque}>
              <FastImage source={NBK_CASQUE} style={styles.casque} />
            </View>
            <View style={styles.backgroundMedium}>
              {isLoading ? (
                <ActivityIndicator color={NBK_COLORS.white} size={30} />
              ) : error ? (
                <Text style={[textStyle.info, styles.error]}>{error}</Text>
              ) : (
                <View style={styles.codeClasseContainer}>
                  <Text onPress={copyCode} style={[textStyle.codeClasse, styles.codeClasse]}>
                    {codeClasse}
                  </Text>
                  <Icon name={'content-copy'} size={25} color={theme.ui.text.inverse} onPress={copyCode} />
                </View>
              )}
              <Text style={textStyle.info}>{I18n.get('nabook-homescreen-info-code')}</Text>
            </View>
            <BtnNBK txt={I18n.get('nabook-btn-installer-app')} clicked={openNabook} />
          </View>
        </View>
        <View>
          <View style={styles.containerDivider}>
            <View style={styles.divider} />
            <Text style={[textStyle.title, styles.or]}>{I18n.get('nabook-or')}</Text>
            <View style={styles.divider} />
          </View>
          <Text style={textStyle.info}>{I18n.get('nabook-homescreen-info-ent')}</Text>
        </View>
      </ScrollView>
    </PageView>
  );
};

export default HomeScreen;
