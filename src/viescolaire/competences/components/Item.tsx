import * as React from "react";
import { View, StyleSheet } from "react-native";

import { TextBold, Text } from "../../../ui/text";
import { Item, LeftColoredItem } from "../../viesco/components/Item";
import { ModalContent, ModalContentBlock, ModalContentText, ModalBox } from "../../../ui/Modal";
import I18n from "i18n-js";
import { ButtonsOkCancel } from "../../../ui";
import { ButtonsOkOnly } from "../../../ui/ButtonsOkCancel";
import { useState } from "react";
import { CommonStyles } from "../../../styles/common/styles";

const styleConstant = StyleSheet.create({
  container: {
    borderRadius: 5,
  },
  mainPart: {},
  coloredSquareText: {
    color: "white",
  },
});

const getColorFromNote = (note, moy) => {
  if (note < moy) {
    return "#E61610";
  } else if (note >= moy && note < moy + 2) {
    return "#FA9701";
  } else {
    return "#46BFAF";
  }
};

const CompetenceRound = competences => {
  const [isVisible, toggleVisible] = React.useState(false);
  return (
    <ModalBox isVisible={isVisible}>
      <ModalContent>
        <ModalContentBlock>
          <ModalContentText>Hello</ModalContentText>
        </ModalContentBlock>
        <ModalContentBlock>
          <ButtonsOkOnly
            onValid={() => {
              toggleVisible(false);
            }}
            title="fermer"
          />
        </ModalContentBlock>
      </ModalContent>
    </ModalBox>
  );
};

const ColoredSquare = (note, coeff, moy) => (
  <View
    style={{
      flexDirection: "column",
      backgroundColor: getColorFromNote(note, moy),
      justifyContent: "center",
      alignItems: "flex-start",
      borderRadius: 5,
    }}>
    <TextBold style={{ alignSelf: "center" }}>{note} / 20</TextBold>
    {coeff && <Text>coeff : {coeff}</Text>}
    {moy && <Text>moy : {moy}</Text>}
  </View>
);

// EXPORTED COMPONENTS

export const MoyItem = ({ note, moy, subMoy }) => {
  const [opened, setOpen] = useState(false);
  return (
    <LeftColoredItem onPress={() => setOpen(!opened)} color={getColorFromNote(note, moy)}>
      <ColoredSquare note={note} />
      {opened && (
        <View>
          {subMoy.map(item => (
            <Text>{item}</Text>
          ))}
        </View>
      )}
    </LeftColoredItem>
  );
};

export const DevoirItem = ({ devoirs }) => {};

export const MatiereDevoirItem = ({ devoirs }) => {};

export const DenseDevoirList = ({ devoirs }) => (
  <LeftColoredItem style={{ padding: 0 }} color="#E61610">
    {devoirs.map((devoir, index) => (
      <View>
        <View style={{ flexDirection: "row", padding: 8 }}>
          <TextBold>{devoir.subject}        </TextBold>
          <Text>{devoir.date}</Text>
          <Text style={{ flexGrow: 1, textAlign: "right" }}>{devoir.note}</Text>
        </View>
        {index !== devoirs.length - 1 && (
          <View
            style={{
              borderBottomColor: CommonStyles.borderColorLighter,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
        )}
      </View>
    ))}
  </LeftColoredItem>
);
