/**
 * Revalidate terms component
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { BackdropPdfReader } from '~/framework/components/backdropPdfReader';
import { UI_SIZES, getScaleDimension } from '~/framework/components/constants';
import { PageViewStyle } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';

export const RevalidateTermsScreen = ({ refuseAction, acceptAction }: { refuseAction: () => void; acceptAction: () => void }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const imageWidth = getScaleDimension(200, 'width');
  const imageHeight = getScaleDimension(200, 'height');
  const platform = DEPRECATED_getCurrentPlatform()!.url;
  const path = I18n.t('common.url.cgu');
  const eulaUrl = `${platform}${path}`;

  return (
    <PageViewStyle
      style={{
        paddingTop: UI_SIZES.spacing.huge,
        paddingHorizontal: UI_SIZES.spacing.medium,
      }}>
      <NamedSVG style={{ alignSelf: 'center' }} name={'empty-eula'} width={imageWidth} height={imageHeight} />
      <HeadingSText
        numberOfLines={2}
        style={{
          textAlign: 'center',
          color: theme.palette.primary.regular,
          marginTop: UI_SIZES.spacing.large,
        }}>
        {I18n.t('user.revalidateTermsScreen.newEULA')}
      </HeadingSText>
      <SmallText numberOfLines={3} style={{ textAlign: 'center', marginTop: UI_SIZES.spacing.small }}>
        {`${I18n.t('user.revalidateTermsScreen.mustAccept')} `}
        <SmallActionText onPress={() => setIsModalVisible(true)} style={{ textDecorationLine: 'underline' }}>
          {I18n.t('user.revalidateTermsScreen.newEndUserLicenseAgreement')}
        </SmallActionText>
      </SmallText>
      <ActionButton style={{ marginTop: UI_SIZES.spacing.large }} text={I18n.t('common.accept')} action={acceptAction} />
      <TouchableOpacity style={{ marginTop: UI_SIZES.spacing.big }} onPress={refuseAction}>
        <SmallBoldText style={{ color: theme.palette.status.failure, textAlign: 'center' }}>
          {I18n.t('user.revalidateTermsScreen.refuseAndDisconnect')}
        </SmallBoldText>
      </TouchableOpacity>
      <BackdropPdfReader
        handleClose={() => setIsModalVisible(false)}
        handleOpen={() => setIsModalVisible(true)}
        visible={isModalVisible}
        title={I18n.t('user.revalidateTermsScreen.EULA')}
        uri={eulaUrl}
      />
    </PageViewStyle>
  );
};
