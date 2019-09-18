import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { ModalContent, ModalBox, ModalContentBlock } from "../../ui/Modal";
import { LightP, Paragraph } from "../../ui/Typography";
import { ButtonsOkCancel } from "../../ui";
import {
  ButtonsOkOnly,
  ButtonsOkCancelReverse
} from "../../ui/ButtonsOkCancel";

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
            <LightP>{I18n.t("common-VersionTitle")}</LightP>
          </ModalContentBlock>
          <ModalContentBlock>
            <Paragraph style={{ textAlign: "center", paddingTop: 12 }}>
              {I18n.t("common-VersionContentMandatory", { version })}
            </Paragraph>
          </ModalContentBlock>
          <ModalContentBlock>
            <ButtonsOkOnly
              onValid={onSubmit}
              title={I18n.t("common-VersionUpdate")}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  } else {
    return (
      <ModalBox backdropOpacity={0.5} isVisible={visibility}>
        <ModalContent>
          <ModalContentBlock>
            <LightP>{I18n.t("common-VersionTitle")}</LightP>
          </ModalContentBlock>
          <ModalContentBlock>
            <Paragraph style={{ textAlign: "center", paddingTop: 12 }}>
              {I18n.t("common-VersionContent", { version })}
            </Paragraph>
          </ModalContentBlock>
          <ModalContentBlock>
            <ButtonsOkCancelReverse
              onCancel={onCancel}
              onValid={onSubmit}
              cancelText={I18n.t("common-VersionSkip")}
              title={I18n.t("common-VersionUpdate")}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }
}
