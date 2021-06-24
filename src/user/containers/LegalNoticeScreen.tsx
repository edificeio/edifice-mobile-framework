import I18n from "i18n-js";
import * as React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { NavigationInjectedProps } from "react-navigation";

import Conf from "../../../ode-framework-conf";
import { BackdropPdfReader } from "../../framework/components/backdropPdfReader";
import {
  FakeHeader,
  HeaderAction,
  HeaderCenter,
  HeaderLeft,
  HeaderRow,
  HeaderTitle,
} from "../../framework/components/header";
import { Icon } from "../../framework/components/icon";
import { ListItem } from "../../framework/components/listItem";
import { PageView } from "../../framework/components/page";
import { Text } from "../../framework/components/text";
import theme from "../../framework/util/theme";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { Trackers } from "../../infra/tracker";
import { CommonStyles } from "../../styles/common/styles";

// TYPES ==========================================================================================

export interface ILegalNoticeScreenState {
  legalTitle: string;
  legalUrl: string;
}

// COMPONENT ======================================================================================
class LegalNoticeScreen extends React.PureComponent<NavigationInjectedProps<{}>, ILegalNoticeScreenState> {
  // DECLARATIONS ===================================================================================

  state: ILegalNoticeScreenState = {
    legalTitle: "",
    legalUrl: "",
  };

  // RENDER =========================================================================================

  render() {
    const { navigation } = this.props;
    const { legalTitle, legalUrl } = this.state;
    const legalItems = ["userCharter", "cgu", "personalDataProtection", "cookies"];
    return (
      <PageView>
        <FakeHeader>
          <HeaderRow>
            <HeaderLeft>
              <HeaderAction
                iconName={Platform.OS === "ios" ? "chevron-left1" : "back"}
                onPress={() => navigation.goBack()}
              />
            </HeaderLeft>
            <HeaderCenter>
              <HeaderTitle>{I18n.t("directory-legalNoticeTitle")}</HeaderTitle>
            </HeaderCenter>
          </HeaderRow>
        </FakeHeader>
        {legalItems.map(legalItem => this.renderLegalItem(legalItem))}
        <BackdropPdfReader
          handleClose={() => this.setState({ legalTitle: "", legalUrl: "" })}
          handleOpen={() => this.setState({ legalTitle, legalUrl })}
          title={legalTitle}
          uri={legalUrl}
          visible={!!legalUrl}
        />
      </PageView>
    );
  }

  renderLegalItem(legalItem: string) {
    return (
      <TouchableOpacity onPress={() => this.handleOpenLegalItem(legalItem)}>
        <ListItem
          leftElement={<Text>{I18n.t(`user.legalNoticeScreen.${legalItem}`)}</Text>}
          rightElement={
            <Icon
              name="arrow_down"
              color={theme.color.secondary.regular}
              style={{ flex: 0, marginLeft: 20, transform: [{ rotate: "270deg" }] }}
            />
          }
        />
      </TouchableOpacity>
    );
  }

  // LIFECYCLE ======================================================================================

  // METHODS ========================================================================================

  handleOpenLegalItem = (legalItem: string) => {
    const platform = Conf.currentPlatform.url;
    const path = I18n.t(`common.url.${legalItem}`);
    const legalUrl = `${platform}${path}`;
    const legalTitle = I18n.t(`user.legalNoticeScreen.${legalItem}`);
    this.setState({ legalUrl, legalTitle });
    Trackers.trackEvent("Profile", "READ NOTICE", legalItem);
  };

  // UTILS ==========================================================================================

  // MAPPING ========================================================================================
}

export default withViewTracking("user/legalNotice")(LegalNoticeScreen);
