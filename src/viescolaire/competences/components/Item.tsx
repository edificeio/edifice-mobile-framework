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
import { ScrollView } from "react-native-gesture-handler";
import moment from "moment";

const styleConstant = StyleSheet.create({
  container: {
    borderRadius: 5,
  },
  mainPart: {},
  coloredSquareText: {
    color: "white",
  },
  devoirsList: {
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 5,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  coloredSquare: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    borderRadius: 5,
    padding: 10,
    minWidth: "25%",
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

const ColoredSquare = ({ note, coeff, moy }) => (
  <View
    style={[styleConstant.coloredSquare, { backgroundColor: getColorFromNote(note, moy) }]}>
    <Text style={{ alignSelf: "center", color: "white", marginVertical: 8 }}>
      <TextBold style={{ fontSize: 20, color: "white" }}>{note}</TextBold> / 20
    </Text>
    {coeff && <Text style={styleConstant.coloredSquareText}>coeff : {coeff}</Text>}
    {moy && <Text style={styleConstant.coloredSquareText}>moy : {moy}</Text>}
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

export const GradesDevoirs = ({ devoirs }) => (
  <ScrollView style={{ flexDirection: "column" }}>
    {devoirs.map((devoir, index) => (
      <View style={styleConstant.devoirsList}>
        <View style={{ padding: 8 }}>
          <TextBold style={{ textTransform: "uppercase" }}>{devoir.matiere}</TextBold>
          <Text style={{ textTransform: "uppercase" }}>{devoir.teacher}</Text>
          <Text>{devoir.subject}</Text>
          <Text>{moment(devoir.date).format("L")}</Text>
        </View>
        <ColoredSquare note={devoir.note} coeff={devoir.coefficient} moy={12} />
      </View>
    ))}
  </ScrollView>
);
