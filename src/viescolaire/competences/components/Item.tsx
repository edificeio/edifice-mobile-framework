import I18n from "i18n-js";
import * as React from "react";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { CommonStyles } from "../../../styles/common/styles";
import { ButtonsOkOnly } from "../../../ui/ButtonsOkCancel";
import { ModalContent, ModalContentBlock, ModalBox } from "../../../ui/Modal";
import { TextBold, Text } from "../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";
import { IDevoir, IDevoirList } from "../state/devoirs";
import { IMoyenneList } from "../state/moyennes";

const getColorfromCompetence = (evaluation: number) => {
  switch (evaluation) {
    case 0:
      return "#555555";
    case 1:
      return "#E13A3A";
    case 2:
      return "#FF8500";
    case 3:
      return "#ECBE30";
    case 4:
      return "#46BFAF";
    default:
      return "#FFFFFF";
  }
};

const getColorFromNote = (note: number, moy: number, diviseur: number) => {
  if (note === diviseur || note > moy) {
    return "#46BFAF";
  } else if (note === moy) {
    return "#FA9701";
  } else if (note < moy) {
    return "#E61610";
  }
};

const CompetenceRoundModal = competences => {
  return (
    <View>
      {competences.map((competence, index) => (
        <ModalContentBlock style={{ flexDirection: "row", justifyContent: "space-around" }} key={index}>
          <Text>{competence.nom}</Text>
          <View style={[styleConstant.round, { backgroundColor: getColorfromCompetence(competence.evaluation) }]} />
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
                title={I18n.t("viesco-close").toUpperCase()}
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
  backgroundColor,
}: {
  note: string;
  coeff?: string;
  moy?: string;
  diviseur?: number;
  hideScore?: boolean;
  backgroundColor?: string;
}) => (
  <View
    style={[
      styleConstant.coloredSquare,
      { backgroundColor: backgroundColor ? backgroundColor : CommonStyles.primary },
    ]}>
    <Text style={{ alignSelf: "center", color: "white", marginVertical: 8 }}>
      <TextBold style={{ fontSize: 20, color: "white" }}>{parseFloat(note).toFixed(1)}</TextBold>
      {!hideScore && `/ ${diviseur}`}
    </Text>
    {coeff && <Text style={styleConstant.coloredSquareText}>coeff : {coeff}</Text>}
    {moy && <Text style={styleConstant.coloredSquareText}>moy : {moy}</Text>}
  </View>
);

const GradesDevoirsResume = ({ devoir }: { devoir: IDevoir }) => (
  <View style={{ padding: 8, maxWidth: "50%" }}>
    <TextBold numberOfLines={1}>{devoir.matiere.toUpperCase()}</TextBold>
    <Text numberOfLines={1}>{devoir.teacher.toUpperCase()}</Text>
    <Text numberOfLines={1}>{devoir.title}</Text>
    <Text>{devoir.date}</Text>
  </View>
);

// EXPORTED COMPONENTS

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

export const GradesDevoirsMoyennes = ({ devoirs }: { devoirs: IMoyenneList }) => (
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    {devoirs.map((devoir, index) => (
      <LeftColoredItem color={CommonStyles.primary} key={index}>
        <View style={styleConstant.devoirsList}>
          <View style={{ padding: 8, maxWidth: "75%" }}>
            <TextBold numberOfLines={1}>{devoir.matiere.toUpperCase()}</TextBold>
            <Text numberOfLines={1}>{devoir.teacher.toUpperCase()}</Text>
          </View>
          <ColoredSquare hideScore note={devoir.moyenne} />
        </View>
        {devoir.devoirs !== undefined
          ? devoir.devoirs.length > 0 &&
            devoir.devoirs.map((course, index) => (
              <View style={styleConstant.subMatieres} key={index}>
                <Text style={{ maxWidth: "85%" }} numberOfLines={1}>{course.name.toUpperCase()}</Text>
                <Text style={{ color: CommonStyles.primary }}>{parseFloat(course.note).toFixed(1)}</Text>
              </View>
            ))
          : null}
      </LeftColoredItem>
    ))}
  </ScrollView>
);

export const GradesDevoirs = ({ devoirs, color }: { devoirs: IDevoirList; color?: boolean }) => (
  <ScrollView>
    {devoirs.map((devoir, index) => (
      <View style={styleConstant.devoirsList} key={index}>
        <GradesDevoirsResume devoir={devoir} />
        <View style={styleConstant.competencesList}>
          {devoir.note !== undefined && devoir.note !== "NN" ? (
            <>
              {devoir.competences !== undefined && (
                <CompetenceRound stateFullRound="center" competences={devoir.competences} />
              )}
              <ColoredSquare
                note={devoir.note}
                coeff={devoir.coefficient}
                moy={devoir.moyenne}
                diviseur={devoir.diviseur}
                backgroundColor={
                  color
                    ? getColorFromNote(parseFloat(devoir.note), parseFloat(devoir.moyenne), devoir.diviseur)
                    : CommonStyles.primary
                }
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
    backgroundColor: CommonStyles.primary,
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
    backgroundColor: "white",
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
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    elevation: 3,
  },
});
