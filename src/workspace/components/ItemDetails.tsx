import * as React from "react";
import { StyleSheet, TouchableOpacity, View, Platform, SafeAreaView } from "react-native";
import I18n from "i18n-js";
import { IEventProps, EVENT_TYPE } from "../types";

import { ButtonIconText } from "../../ui";
import { layoutSize } from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";
import { CommonStyles } from "../../styles/common/styles";

const styles = StyleSheet.create({
  mainPanel: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: CommonStyles.lightGrey,
  },
  bodyPanel: {
    flex: 1,
    flexGrow: 1,
  },
  bottomPanel: {
    height: layoutSize.LAYOUT_80,
  },
  buttonPanel: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
  },
});

export const ItemDetails = ({ onEvent, item }: IEventProps & any) => {
  const { name } = item as IFile;

  const getPreviewImage = () => {
    if (Platform.OS === "ios") {
      return renderImage(item, false, name);
    } else {
      return (
        <TouchableOpacity onPress={() => onEvent({ type: EVENT_TYPE.PREVIEW, item })}>
          {renderImage(item, false, name)}
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.mainPanel}>
      <View style={styles.bodyPanel}>{getPreviewImage()}</View>
      <View style={styles.bottomPanel}>
        <View style={styles.buttonPanel}>
          <ButtonIconText name="download" onPress={() => onEvent({ type: EVENT_TYPE.DOWNLOAD, item })}>
            {I18n.t("download")}
          </ButtonIconText>
          <ButtonIconText name="share-variant" onPress={() => onEvent({ type: EVENT_TYPE.SHARE, item })}>
            {I18n.t("share")}
          </ButtonIconText>
        </View>
      </View>
    </View>
  );
};
