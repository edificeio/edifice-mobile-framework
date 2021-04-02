import * as React from "react";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { CommonStyles } from "../../../styles/common/styles";
import { ButtonsOkOnly } from "../../../ui/ButtonsOkCancel";
import { ModalContent, ModalContentBlock, ModalContentText, ModalBox } from "../../../ui/Modal";
import { TextBold, Text } from "../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";

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
          <ModalContentText style={{ fontWeight: "bold" }}>{competence.nom}</ModalContentText>
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

const ColoredSquare = ({
  note,
  coeff,
  moy,
  diviseur,
  hideScore,
}: {
  note: string;
  coeff: string;
  moy: string;
  diviseur: number;
  hideScore: boolean;
}) => (
  <View style={[styleConstant.coloredSquare, { backgroundColor: getColorFromNote(note, moy) }]}>
    <Text style={{ alignSelf: "center", color: "white", marginVertical: 8 }}>
      <TextBold style={{ fontSize: 20, color: "white" }}>{note}</TextBold>{!hideScore && `/ ${diviseur}`}
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
    {devoirs.map((devoir, index) => (
      <LeftColoredItem color={getColorFromNote(devoir.moyenne, 10)} key={index}>
        <View style={styleConstant.devoirsList}>
          <View style={{ padding: 8 }}>
            <TextBold>{devoir.matiere.toUpperCase()}</TextBold>
            <Text>{devoir.teacher.toUpperCase()}</Text>
          </View>
          <ColoredSquare hideScore note={Number.parseFloat(devoir.moyenne).toFixed(1)} />
        </View>
        {devoir.devoirs !== undefined
          ? devoir.devoirs.length > 0 &&
            devoir.devoirs.map((course, index) => (
              <View style={styleConstant.subMatieres} key={index}>
                <Text style={{ textTransform: "uppercase" }}>{course.name}</Text>
                <Text style={{ color: getColorFromNote(course.note, course.diviseur / 2) }}>
                  {Number.parseFloat(course.note).toFixed(1)}
                </Text>
              </View>
            ))
          : null}
      </LeftColoredItem>
    ))}
  </ScrollView>
);

export const GradesDevoirs = ({ devoirs }) => (
  <ScrollView>
    {devoirs.map((devoir, index) => (
      <View style={styleConstant.devoirsList} key={index}>
        <View style={{ padding: 8, maxWidth: "50%" }}>
          <TextBold numberOfLines={1}>{devoir.matiere.toUpperCase()}</TextBold>
          <Text numberOfLines={1}>{devoir.teacher.toUpperCase()}</Text>
          <Text numberOfLines={1}>{devoir.title}</Text>
          <Text>{devoir.date}</Text>
        </View>
        <View style={styleConstant.competencesList}>
          {devoir.note !== undefined ? (
            <>
              {devoir.competences !== undefined && (
                <CompetenceRound stateFullRound="center" competences={devoir.competences} />
              )}
              <ColoredSquare
                note={devoir.note}
                coeff={devoir.coefficient}
                moy={devoir.moyenne}
                diviseur={devoir.diviseur}
              />
            </>
          ) : (
            devoir.competences !== undefined && (
              <CompetenceRound stateFullRound="flex-end" competences={devoir.competences} />
            )
          )}
        </View>
      </View>
    ))}
  </ScrollView>
);

// STYLE

const styleConstant = StyleSheet.create({
  container: { borderRadius: 5 },
  coloredSquareText: { color: "white" },
  devoirsList: {
    width: "100%",
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
