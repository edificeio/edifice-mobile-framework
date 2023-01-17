/**
 * Revalidate terms component
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { BackdropPdfReader } from '~/framework/components/backdropPdfReader';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES, getScaleImageSize } from '~/framework/components/constants';
import { PageViewStyle } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingSText, SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';

export const RevalidateTermsScreen = ({
  cguUrl,
  refuseAction,
  acceptAction,
}: {
  cguUrl?: string;
  refuseAction: () => void;
  acceptAction: () => void;
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const imageSize = getScaleImageSize(200);

  return (
    <PageViewStyle
      style={{
        paddingTop: UI_SIZES.spacing.huge,
        paddingHorizontal: UI_SIZES.spacing.medium,
      }}>
      <NamedSVG style={{ alignSelf: 'center' }} name={'empty-eula'} width={imageSize} height={imageSize} />
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
        <SmallBoldText style={{ color: theme.palette.status.failure.regular, textAlign: 'center' }}>
          {I18n.t('user.revalidateTermsScreen.refuseAndDisconnect')}
        </SmallBoldText>
      </TouchableOpacity>
      <BackdropPdfReader
        handleClose={() => setIsModalVisible(false)}
        handleOpen={() => setIsModalVisible(true)}
        visible={isModalVisible}
        title={I18n.t('user.revalidateTermsScreen.EULA')}
        uri={cguUrl}
      />
    </PageViewStyle>
  );
};
