import I18n from "i18n-js";
import * as React from "react";
import { Platform, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import WebView from "react-native-webview";
import Backdrop from "react-native-material-backdrop-modal";

import { Icon } from "../../framework/components/icon";
import { ListItem } from "../../framework/components/listItem";
import { PageView } from "../../framework/components/page";
import { Text } from "../../framework/components/text";
import theme from "../../framework/util/theme";
import Conf from "../../../ode-framework-conf";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { Trackers } from "../../infra/tracker";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from "../../framework/components/header";

// TYPES ==========================================================================================

// COMPONENT ======================================================================================
class LegalNoticeScreen extends React.PureComponent {

	// DECLARATIONS ===================================================================================

  state = {
    modalVisible: false,
    url: undefined
  }

  // RENDER =========================================================================================

  render () {
    const { navigation } = this.props;
    const { modalVisible, url } = this.state;
    const legalItems = ["cgu", "personalDataProtection", "cookies"];
    return (
      <>
        <PageView>
          {modalVisible
            ? <TouchableWithoutFeedback
                onPress={() => this.setState({modalVisible: false})}
              >
                <View
                  style={{
                    position: "absolute",
                    zIndex: 1,
                    backgroundColor: "grey",
                    opacity: 0.8,
                    top: 0, bottom: 0, left: 0, right: 0
                  }}
                />
              </TouchableWithoutFeedback>
            : null
          }
          <FakeHeader>
            <HeaderRow>
              <HeaderLeft>
                <HeaderAction
                  iconName={(Platform.OS === "ios") ? "chevron-left1" : "back"}
                  onPress={() => navigation.goBack()}
                />
              </HeaderLeft>
              <HeaderCenter>
                <HeaderTitle>{I18n.t("directory-legalNoticeTitle")}</HeaderTitle>
              </HeaderCenter>
            </HeaderRow>
          </FakeHeader>
          {legalItems.map(legalItem => this.renderLegalItem(legalItem))}
        </PageView>
        <Backdrop
          focused={modalVisible}
          backdropStyle={{top: 100}}
          icon={
            <TouchableOpacity
              onPress={() => this.setState({modalVisible: false})}
            >
              <Icon name="arrow_down" />
            </TouchableOpacity>
          }
        >
          <WebView source={{uri: url}}/>
        </Backdrop>
      </>
    );
  }

  renderLegalItem(legalItem: string) {
    return (
      <TouchableOpacity onPress={() => this.handleOpenLegalItem(legalItem)}>
        <ListItem
          leftElement={
            <Text>{I18n.t(`user.legalNoticeScreen.${legalItem}`)}</Text>
          }
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
    const url = `${platform}${path}`;
    this.setState({modalVisible: true, url})
    Trackers.trackEvent("Profile", "READ NOTICE", legalItem);
  };

  // UTILS ==========================================================================================

  // MAPPING ========================================================================================
}

export default withViewTracking("user/LegalNotice")(LegalNoticeScreen);
