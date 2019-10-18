import * as React from "react"
import { StyleSheet, View } from "react-native";
import { IEventProps, EVENT_TYPE } from "../types";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { TextBold15 } from "../../ui/text";
import { layoutSize } from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";
import { TouchCard } from "../../ui/Card";
import I18n from "i18n-js";

const styles = StyleSheet.create({
  mainPanel: {
    margin: layoutSize.LAYOUT_14
  },
  contentPanel: {
    flexDirection: 'row',
    height: layoutSize.LAYOUT_160,
    justifyContent: 'space-around',
  },
  imagePanel: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  touchCard: {
    height: "80%",
    width: "80%",
    alignItems: "center",
    justifyContent: "space-evenly",
  }
});


export const ItemDetails = ({onEvent, ...item} : IFile & IEventProps) => {
  const {id, name} = item;

  return (
    <View style={styles.mainPanel}>
      <View style={styles.imagePanel}>
        {renderImage(id, false, name)}
      </View>
      <View style={styles.contentPanel}>
        <TouchCard style={styles.touchCard} onPress={() => onEvent(EVENT_TYPE.DOWNLOAD, item)}>
          <Icon color={CommonStyles.profileTypes.Student} size={layoutSize.LAYOUT_60} name="download"/>
          <TextBold15>{I18n.t("download")}</TextBold15>
        </TouchCard>
        <TouchCard style={styles.touchCard} onPress={() => onEvent(EVENT_TYPE.SHARE, item)}>
          <Icon color={CommonStyles.profileTypes.Student} size={layoutSize.LAYOUT_60} name="share-variant"/>
          <TextBold15>{I18n.t("share")}</TextBold15>
        </TouchCard>
      </View>
    </View>
  )
};
