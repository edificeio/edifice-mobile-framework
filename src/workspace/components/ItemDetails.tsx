import * as React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IEventProps, EVENT_TYPE } from "../types";
import I18n from "i18n-js";

import { ButtonIconText, Icon } from "../../ui";
import { layoutSize } from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";

const styles = StyleSheet.create({
  mainPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentPanel: {
    flexDirection: 'row',
    height: layoutSize.LAYOUT_120,
    justifyContent: 'space-around',
  },
  imagePanel: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    margin: layoutSize.LAYOUT_14,
  },
  touchCard: {
    alignItems: "center",
    justifyContent: "space-evenly",
  }
});


export const ItemDetails = ({ onEvent, ...item }: IFile & IEventProps) => {
  const { id, name } = item;

  return (
    <View style={styles.mainPanel}>
      <TouchableOpacity style={styles.imagePanel} onPress={() => onEvent(EVENT_TYPE.PREVIEW, item)}>
          {renderImage(item, false, name)}
      </TouchableOpacity>
      <View style={styles.contentPanel}>
        <ButtonIconText
          name="download"
          onPress={() => onEvent(EVENT_TYPE.DOWNLOAD, item)}>
          {I18n.t("download")}
        </ButtonIconText>
        <ButtonIconText
          name="share-variant"
          onPress={() => onEvent(EVENT_TYPE.SHARE, item)}
        >
          {I18n.t("share")}
        </ButtonIconText>
      </View>
    </View>
  )
};
