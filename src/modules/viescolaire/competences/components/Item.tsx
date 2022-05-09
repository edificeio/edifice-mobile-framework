import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { useState } from 'react';
import { FlexAlignType, StyleSheet, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import { Text, TextBold } from '~/framework/components/text';
import { ILevelsList } from '~/modules/viescolaire/competences/state/competencesLevels';
import { IDevoir, IDevoirList } from '~/modules/viescolaire/competences/state/devoirs';
import { IMoyenneList } from '~/modules/viescolaire/competences/state/moyennes';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { CommonStyles } from '~/styles/common/styles';
import { ButtonsOkOnly } from '~/ui/ButtonsOkCancel';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

// STYLE

const styleConstant = StyleSheet.create({
  dash: { height: 15, width: 30, borderRadius: 10, marginTop: 2 },
  container: { borderRadius: 5 },
  coloredSquareText: { color: 'white' },
  devoirsList: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  competencesList: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    maxWidth: '50%',
  },
  coloredSquare: {
    backgroundColor: CommonStyles.primary,
    borderRadius: 5,
    padding: 10,
    minWidth: '29%',
  },
  coloredSquareNoteTextContainer: {
    alignSelf: 'center',
    color: 'white',
    marginVertical: 8,
  },
  coloredSquareNoteText: {
    fontSize: 20,
    color: 'white',
  },
  gradeDevoirsNoteContainer: {
    justifyContent: 'center',
  },
  gradeDevoirsNoteText: {
    alignSelf: 'center',
    fontSize: 20,
    color: 'white',
  },
  competenceRoundContainer: {
    width: '25%',
    justifyContent: 'center',
  },
  competenceRoundContainerWidthQuarter: {
    width: '25%',
  },
  competenceRoundContainerWidthAuto: {
    width: 'auto',
  },
  competenceRound: {
    borderRadius: 45,
    minWidth: 60,
    minHeight: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  competenceRoundText: {
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  competenceRoundModalStyle: {
    width: '100%',
  },
  competenceRoundModalContentStyle: {
    marginLeft: -20,
    marginRight: 20,
  },
  competenceRoundModalText: {
    width: '85%',
  },
  round: {
    marginLeft: 5,
    height: 25,
    width: 25,
    borderRadius: 15,
  },
  subMatieres: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  modalBlock: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
  },
  gradesDevoirsMoyennesView: {
    flexGrow: 1,
  },
  gradesDevoirsMoyennesItemView: {
    padding: 8,
    maxWidth: '75%',
  },
  gradesDevoirsMoyennesCourseNameText: {
    maxWidth: '80%',
  },
  denseDevoirListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  denseDevoirListMatiereContainer: {
    flexDirection: 'row',
    width: '75%',
    padding: 8,
    justifyContent: 'space-between',
  },
  denseDevoirListMatiereText: {
    maxWidth: '65%',
    paddingRight: 10,
  },
  denseDevoirListNoteText: {
    flexGrow: 1,
    textAlign: 'right',
    fontSize: 18,
    paddingTop: 8,
  },
  denseDevoirListDiviseurText: {
    paddingTop: 8,
  },
  gradesDevoirsResumeContainer: {
    padding: 8,
    maxWidth: '52%',
  },
});

// COMPONENTS

const getColorfromCompetence = (evaluation: number, levels: ILevelsList) => {
  const cycleLevels = levels.filter(obj => {
    return obj.cycle === 'Cycle 3';
  });
  if (evaluation >= 0 && evaluation < cycleLevels.length) {
    const color = cycleLevels[evaluation].couleur;
    return color ? color : cycleLevels[evaluation].default;
  }
  return '#DDDDDD';
};

const getColorFromNote = (note: number, moy: number, diviseur: number) => {
  if (note === diviseur || note > moy) {
    return '#46BFAF';
  } else if (note === moy) {
    return '#FA9701';
  } else if (note < moy) {
    return '#E61610';
  }
};

const CompetenceRoundModal = (competences: any, levels: ILevelsList) => {
  return competences.map((competence, index) => (
    <ModalContentBlock style={styleConstant.modalBlock} key={index}>
      <Text style={styleConstant.competenceRoundModalText}>{competence.nom}</Text>
      <View style={[styleConstant.round, { backgroundColor: getColorfromCompetence(competence.evaluation, levels) }]} />
    </ModalContentBlock>
  ));
};

const CompetenceRound = ({
  competences,
  stateFullRound,
  size,
  levels,
}: {
  competences: any;
  stateFullRound: FlexAlignType;
  size: number;
  levels: ILevelsList;
}) => {
  const [isVisible, toggleVisible] = useState(false);
  return (
    <View
      style={[
        styleConstant.competenceRoundContainer,
        stateFullRound === 'flex-end'
          ? styleConstant.competenceRoundContainerWidthAuto
          : styleConstant.competenceRoundContainerWidthQuarter,
        { alignItems: stateFullRound },
      ]}>
      {competences.length > 0 && (
        <TouchableOpacity
          style={[styleConstant.competenceRound, styleConstant.shadow, { minHeight: size, minWidth: size }]}
          onPress={() => toggleVisible(!isVisible)}>
          <TextBold style={styleConstant.competenceRoundText}>C</TextBold>
        </TouchableOpacity>
      )}

      {isVisible && (
        <ModalBox isVisible={isVisible}>
          <ModalContent>
            <ScrollView
              style={styleConstant.competenceRoundModalStyle}
              contentContainerStyle={styleConstant.competenceRoundModalContentStyle}
              showsVerticalScrollIndicator={false}>
              {CompetenceRoundModal(competences, levels)}
            </ScrollView>
            <ModalContentBlock>
              <ButtonsOkOnly onValid={() => toggleVisible(false)} title={I18n.t('viesco-close').toUpperCase()} />
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
  <View style={[styleConstant.coloredSquare, { backgroundColor: backgroundColor ? backgroundColor : CommonStyles.primary }]}>
    <Text style={styleConstant.coloredSquareNoteTextContainer}>
      {!isNaN(Number(note)) ? (
        <>
          <TextBold style={styleConstant.coloredSquareNoteText}>{+parseFloat(Number(note).toFixed(2))}</TextBold>
          {!hideScore ? `/ ${diviseur}` : null}
        </>
      ) : (
        <TextBold style={styleConstant.coloredSquareNoteText}>{note}</TextBold>
      )}
    </Text>
    {coeff ? <Text style={styleConstant.coloredSquareText}>coeff : {coeff}</Text> : null}
    {moy ? <Text style={styleConstant.coloredSquareText}>moy : {moy}</Text> : null}
  </View>
);

const GradesDevoirsResume = ({ devoir }: { devoir: IDevoir }) => (
  <View style={styleConstant.gradesDevoirsResumeContainer}>
    <TextBold numberOfLines={1}>{devoir.matiere.toUpperCase()}</TextBold>
    <Text numberOfLines={1}>{devoir.teacher.toUpperCase()}</Text>
    <Text numberOfLines={1}>{devoir.title}</Text>
    <Text>{moment(devoir.date).format('L')}</Text>
  </View>
);

// EXPORTED COMPONENTS

export const DenseDevoirList = ({ devoirs, levels }: { devoirs: IDevoirList; levels: ILevelsList }) => (
  <>
    {devoirs.map((devoir, index) => (
      <LeftColoredItem shadow color="#F95303" key={index}>
        <View style={styleConstant.denseDevoirListContainer}>
          <View style={styleConstant.denseDevoirListMatiereContainer}>
            <TextBold style={styleConstant.denseDevoirListMatiereText} numberOfLines={1}>
              {devoir.matiere}
            </TextBold>
            <Text>{moment(devoir.date).format('L')}</Text>
          </View>
          {devoir.competences.length ? (
            <CompetenceRound stateFullRound="flex-end" competences={devoir.competences} size={35} levels={levels} />
          ) : (
            isNaN(Number(devoir.note)) && <TextBold style={styleConstant.denseDevoirListNoteText}>{devoir.note}</TextBold>
          )}
          {devoir.note && !isNaN(Number(devoir.note)) && (
            <>
              <TextBold style={styleConstant.denseDevoirListNoteText}>{devoir.note.replace(/\./g, ',')}</TextBold>
              <Text style={styleConstant.denseDevoirListDiviseurText}>/{devoir.diviseur}</Text>
            </>
          )}
        </View>
      </LeftColoredItem>
    ))}
  </>
);

export const GradesDevoirsMoyennes = ({ devoirs }: { devoirs: IMoyenneList }) => (
  <ScrollView contentContainerStyle={styleConstant.gradesDevoirsMoyennesView}>
    {devoirs.map((devoir, index) => (
      <LeftColoredItem color={CommonStyles.primary} key={index}>
        <View style={styleConstant.devoirsList}>
          <View style={styleConstant.gradesDevoirsMoyennesItemView}>
            <TextBold numberOfLines={1}>{devoir.matiere.toUpperCase()}</TextBold>
            <Text numberOfLines={1}>{devoir.teacher.toUpperCase()}</Text>
          </View>
          <ColoredSquare hideScore note={devoir.moyenne} />
        </View>
        {devoir.devoirs !== undefined
          ? devoir.devoirs.length > 0 &&
            devoir.devoirs.map(
              (course, index) =>
                course.is_evaluated && (
                  <View style={styleConstant.subMatieres} key={index}>
                    <Text style={styleConstant.gradesDevoirsMoyennesCourseNameText} numberOfLines={1}>
                      {course.name.toUpperCase()}
                    </Text>
                    {course.note ? (
                      <Text style={{ color: CommonStyles.primary }}>
                        {course.note}/{course.diviseur}
                      </Text>
                    ) : (
                      course.libelle_court && <Text style={{ color: CommonStyles.primary }}>{course.libelle_court}</Text>
                    )}
                  </View>
                ),
            )
          : null}
      </LeftColoredItem>
    ))}
  </ScrollView>
);

export const GradesDevoirs = ({ devoirs, levels, color }: { devoirs: IDevoirList; levels: ILevelsList; color?: boolean }) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    {devoirs.map((devoir, index) => (
      <View style={styleConstant.devoirsList} key={index}>
        <GradesDevoirsResume devoir={devoir} />
        <View style={styleConstant.competencesList}>
          {devoir.note !== undefined && !isNaN(Number(devoir.note)) ? (
            <>
              {devoir.competences !== undefined && (
                <CompetenceRound stateFullRound="center" competences={devoir.competences} size={60} levels={levels} />
              )}
              <ColoredSquare
                note={devoir.note}
                coeff={devoir.coefficient}
                moy={devoir.moyenne}
                diviseur={devoir.diviseur}
                backgroundColor={
                  color
                    ? getColorFromNote(
                        parseFloat(devoir.note.replace(/\./g, ',').replace(',', '.')),
                        parseFloat(devoir.moyenne.replace(/\./g, ',').replace(',', '.')),
                        devoir.diviseur,
                      )
                    : CommonStyles.primary
                }
              />
            </>
          ) : devoir.competences !== undefined && devoir.competences.length ? (
            <CompetenceRound stateFullRound="flex-end" competences={devoir.competences} size={60} levels={levels} />
          ) : (
            <View style={[styleConstant.coloredSquare, styleConstant.gradeDevoirsNoteContainer]}>
              <TextBold style={styleConstant.gradeDevoirsNoteText}>{devoir.note}</TextBold>
            </View>
          )}
        </View>
      </View>
    ))}
  </ScrollView>
);

export const getSortedEvaluationList = (evaluations: IDevoirList) => {
  return evaluations.sort(
    (a, b) =>
      moment(b.date).diff(moment(a.date)) ||
      String(a.matiere.toLocaleLowerCase() ?? '').localeCompare(b.matiere.toLocaleLowerCase() ?? '') ||
      Number(a.note) - Number(b.note),
  );
};
