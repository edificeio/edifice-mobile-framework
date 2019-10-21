import * as React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IEventProps, EVENT_TYPE } from "../types";
import I18n from "i18n-js";

import { CommonStyles } from "../../styles/common/styles";
import { ButtonIconText, Icon } from "../../ui";
import { TextBold15 } from "../../ui/text";
import { layoutSize } from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";
import { TouchCard } from "../../ui/Card";

const styles = StyleSheet.create({
  mainPanel: {
    backgroundColor: '#FFFFFF',
  },
  contentPanel: {
    flexDirection: 'row',
    height: layoutSize.LAYOUT_120,
    justifyContent: 'space-around',
  },
  imagePanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: layoutSize.LAYOUT_14
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
          {renderImage(id, false, name)}
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
