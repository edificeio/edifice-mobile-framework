import moment from "moment";
import * as React from "react";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { CommonStyles } from "../../../../styles/common/styles";
import { ButtonsOkOnly } from "../../../../ui/ButtonsOkCancel";
import { ModalContent, ModalContentBlock, ModalContentText, ModalBox } from "../../../../ui/Modal";
import { TextBold, Text } from "../../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";

const styleConstant = StyleSheet.create({
  container: { borderRadius: 5 },
  coloredSquareText: { color: "white" },
  devoirsList: {
    justifyContent: "space-between",
    flexDirection: "row",
    borderRadius: 5,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  competencesList: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  coloredSquare: {
    borderRadius: 5,
    padding: 10,
    minWidth: "25%",
  },
  competenceRoundContainer: {
    width: "25%",
    justifyContent: "center",
  },
  competenceRound: {
    borderRadius: 45,
    minWidth: 60,
    minHeight: 60,
    marginLeft: 20,
  },
  competenceRoundText: {
    paddingTop: 25,
    textAlign: "center",
    fontSize: 20,
  },
  round: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignSelf: "flex-end",
  },
  subMatieres: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 3,
  },
});

const getColorFromNote = (note, moy) => {
  if (!moy) {
    moy = 10;
  }
  if (note < moy) {
    return "#E61610";
  } else if (note >= moy && note < moy + 2) {
    return "#FA9701";
  } else {
    return "#46BFAF";
  }
};

const CompetenceRoundModal = competences => {
  return (
    <View>
      {competences.map(competence => (
        <ModalContentBlock>
          <ModalContentText style={{ fontWeight: "bold" }}>D1. - Langage mathématiques</ModalContentText>
          <ModalContentText>{competence.label}</ModalContentText>
          <ModalContentText style={[styleConstant.round, { backgroundColor: getColorFromNote(competence.note, 2) }]}>
            {" "}
          </ModalContentText>
        </ModalContentBlock>
      ))}
    </View>
  );
}

const CompetenceRound = ({ competences, stateFullRound }) => {
  const [isVisible, toggleVisible] = useState(false);
  return (
    <View style={[styleConstant.competenceRoundContainer, { alignItems: stateFullRound }]}>
      {competences.length > 0 && (
        <TouchableOpacity
          style={[styleConstant.competenceRound, styleConstant.shadow]}
          onPress={() => toggleVisible(!isVisible)}>
          <TextBold style={styleConstant.competenceRoundText}>C</TextBold>
        </TouchableOpacity>
      )}

      {isVisible && (
        <ModalBox isVisible={isVisible}>
          <ModalContent>
            {CompetenceRoundModal(competences)}
            <ModalContentBlock>
              <ButtonsOkOnly
                onValid={() => {
                  toggleVisible(false);
                }}
                title="FERMER"
              />
            </ModalContentBlock>
          </ModalContent>
        </ModalBox>
      )}
    </View>
  );
};

const ColoredSquare = ({ note, coeff, moy, hideScore }) => (
  <View style={[styleConstant.coloredSquare, { backgroundColor: getColorFromNote(note, moy) }]}>
    <Text style={{ alignSelf: "center", color: "white", marginVertical: 8 }}>
      <TextBold style={{ fontSize: 20, color: "white" }}>{note}</TextBold>{!hideScore && "/ 20"}
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

export const GradesDevoirsMoyennes = ({ devoirs }) => (
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    {devoirs.map(devoir => (
      <LeftColoredItem color={getColorFromNote(devoir.note, 10)} key={devoir.id}>
        <View style={styleConstant.devoirsList}>
          <View style={{ padding: 8 }}>
            <TextBold style={{ textTransform: "uppercase" }}>{devoir.matiere}</TextBold>
            <Text style={{ textTransform: "uppercase" }}>{devoir.teacher}</Text>
          </View>
          <ColoredSquare hideScore note={devoir.note.toFixed(1)} />
        </View>
        {devoir.moySousMatiere !== undefined
          ? devoir.moySousMatiere.length > 0 &&
            devoir.moySousMatiere.map(course => (
              <View style={styleConstant.subMatieres}>
                <Text style={{ textTransform: "uppercase" }}>{course.matiere}</Text>
                <Text style={{ color: getColorFromNote(course.note, 10) }}>{course.note.toFixed(1)}</Text>
              </View>
            ))
          : null}
      </LeftColoredItem>
    ))}
  </ScrollView>
);

export const GradesDevoirs = ({ devoirs }) => (
  <ScrollView>
    {devoirs.map(devoir => (
      <View style={styleConstant.devoirsList} key={devoir.id}>
        <View style={{ padding: 8 }}>
          <TextBold style={{ textTransform: "uppercase" }}>{devoir.matiere}</TextBold>
          <Text style={{ textTransform: "uppercase" }}>{devoir.teacher}</Text>
          <Text>{devoir.subject}</Text>
          <Text>{moment(devoir.date).format("L")}</Text>
        </View>
        <View style={styleConstant.competencesList}>
          {devoir.note !== undefined ? (
            <>
              {devoir.competences !== undefined ? (
                <CompetenceRound stateFullRound="center" competences={devoir.competences} />
              ) : null}
              <ColoredSquare note={devoir.note} coeff={devoir.coefficient} moy={12} />
            </>
          ) : (
            <CompetenceRound stateFullRound="flex-end" competences={devoir.competences} />
          )}
        </View>
      </View>
    ))}
  </ScrollView>
);
