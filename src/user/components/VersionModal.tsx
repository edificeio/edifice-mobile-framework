import I18n from 'i18n-js';
import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { ButtonsOkCancelReverse, ButtonsOkOnly } from '~/ui/ButtonsOkCancel';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

export default function VersionModal(props: {
  version: string;
  visibility: boolean;
  mandatory: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { mandatory, visibility, version, onCancel, onSubmit } = props;
  if (!visibility) {
    return null;
  }
  if (mandatory) {
    return (
      <ModalBox backdropOpacity={0.5} isVisible={visibility}>
        <ModalContent>
          <ModalContentBlock>
            <SmallText style={{ color: theme.ui.text.light }}>{I18n.t('common-VersionTitle')}</SmallText>
          </ModalContentBlock>
          <ModalContentBlock>
            <SmallText style={{ textAlign: 'center', paddingTop: UI_SIZES.spacing.small }}>
              {I18n.t('common-VersionContentMandatory', { version })}
            </SmallText>
          </ModalContentBlock>
          <ModalContentBlock>
            <ButtonsOkOnly onValid={onSubmit} title={I18n.t('common-VersionUpdate')} />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  } else {
    return (
      <ModalBox backdropOpacity={0.5} isVisible={visibility}>
        <ModalContent>
          <ModalContentBlock>
            <SmallText style={{ color: theme.ui.text.light }}>{I18n.t('common-VersionTitle')}</SmallText>
          </ModalContentBlock>
          <ModalContentBlock>
            <Paragraph style={{ textAlign: 'center', paddingTop: UI_SIZES.spacing.small }}>
              {I18n.t('common-VersionContent', { version })}
            </Paragraph>
          </ModalContentBlock>
          <ModalContentBlock>
            <ButtonsOkCancelReverse
              onCancel={onCancel}
              onValid={onSubmit}
              cancelText={I18n.t('common-VersionSkip')}
              title={I18n.t('common-VersionUpdate')}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }
}
