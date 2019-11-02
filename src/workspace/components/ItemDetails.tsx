import * as React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IEventProps, EVENT_TYPE } from "../types";
import I18n from "i18n-js";

import { ButtonIconText, Icon } from "../../ui";
import {DEVICE_WIDTH, layoutSize} from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";
import LinearGradient from "react-native-linear-gradient";

const styles = StyleSheet.create({
  mainPanel: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#000000',
  },
  contentPanel: {
    flexDirection: 'row',
    height: layoutSize.LAYOUT_50,
    justifyContent: 'space-around',
  },
  imagePanel: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flex: 1,
    alignItems: "center",
    justifyContent: 'center'
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
        <View  style={styles.contentPanel}>
            <ButtonIconText
              name="share-variant"
              onPress={() => onEvent(EVENT_TYPE.SHARE, item)} />
            <ButtonIconText
              name="download"
              onPress={() => onEvent(EVENT_TYPE.DOWNLOAD, item)}/>
      </View>
    </View>
  )
};
