import * as React from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { IEventProps, EVENT_TYPE } from "../types";
import I18n from "i18n-js";

import { ButtonIconText, Icon } from "../../ui";
import { DEVICE_WIDTH, layoutSize } from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";
import { CommonStyles } from "../../styles/common/styles";

const styles = StyleSheet.create({
  mainPanel: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: CommonStyles.lightGrey,
  },
  bottomPanel: {
    height: layoutSize.LAYOUT_68,
  },
  buttonPanel: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
  },
  imagePanel: {
    backgroundColor: "transparent",
    flex: 1,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export const ItemDetails = ({ onEvent, ...item }: IFile & IEventProps) => {
  const { id, name } = item;

  const getPreviewImage = () => {
    if (Platform.OS == "ios") {
      return (
        renderImage(item, false, name)
      )
    } else {
      return (
        <TouchableOpacity style={styles.imagePanel} onPress={() => onEvent(EVENT_TYPE.PREVIEW, item)}>
          {renderImage(item, false, name)}
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.mainPanel}>
      {getPreviewImage()}
      <View style={styles.bottomPanel}>
        <View style={styles.buttonPanel}>
          <ButtonIconText name="download" onPress={() => onEvent(EVENT_TYPE.DOWNLOAD, item)}>
            {I18n.t("download")}
          </ButtonIconText>
          <ButtonIconText name="share-variant" onPress={() => onEvent(EVENT_TYPE.SHARE, item)}>
            {I18n.t("share")}
          </ButtonIconText>
        </View>
      </View>
    </View>
  );
};
