import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { useState } from 'react';
import { FlatList, FlexAlignType, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { ILevelsList } from '~/modules/viescolaire/competences/state/competencesLevels';
import { IDevoir, IDevoirList } from '~/modules/viescolaire/competences/state/devoirs';
import { IMoyenneList } from '~/modules/viescolaire/competences/state/moyennes';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { ButtonsOkOnly } from '~/ui/ButtonsOkCancel';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

import { viescoTheme } from '../../viesco/utils/viescoTheme';

// STYLE

const styleConstant = StyleSheet.create({
  coloredSquareText: { color: theme.palette.grey.white },
  devoirsList: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 5,
    backgroundColor: theme.palette.grey.white,
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
  },
  competencesList: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    maxWidth: '50%',
  },
  coloredSquare: {
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: 5,
    padding: 10, // MO-142 use UI_SIZES.spacing here
    minWidth: '29%',
  },
  coloredSquareNoteTextContainer: {
    alignSelf: 'center',
    color: theme.palette.grey.white,
    marginVertical: UI_SIZES.spacing.minor, // MO-142 use UI_SIZES.spacing here
  },
  coloredSquareNoteText: {
    ...TextSizeStyle.Big,
    color: theme.palette.grey.white,
  },
  gradeDevoirsNoteContainer: {
    justifyContent: 'center',
  },
  gradeDevoirsNoteText: {
    ...TextSizeStyle.Big,
    alignSelf: 'center',
    color: theme.palette.grey.white,
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
    backgroundColor: theme.palette.grey.white,
    justifyContent: 'center',
  },
  competenceRoundText: {
    ...TextSizeStyle.Big,
    textAlign: 'center',
  },
  competenceRoundModalStyle: {
    width: '100%',
  },
  competenceRoundModalContentStyle: {
    marginLeft: -20, // MO-142 use UI_SIZES.spacing here
    marginRight: 20, // MO-142 use UI_SIZES.spacing here
  },
  competenceRoundModalText: {
    width: '85%',
  },
  round: {
    marginLeft: 5, // MO-142 use UI_SIZES.spacing here
    height: 25,
    width: 25,
    borderRadius: UI_SIZES.spacing.medium,
  },
  subMatieres: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10, // MO-142 use UI_SIZES.spacing here
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 1.0)',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  modalBlock: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // MO-142 use UI_SIZES.spacing here
    padding: 10, // MO-142 use UI_SIZES.spacing here
  },
  gradesDevoirsMoyennesView: {
    flexGrow: 1,
  },
  gradesDevoirsMoyennesItemView: {
    padding: UI_SIZES.spacing.minor,
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
    padding: UI_SIZES.spacing.minor,
    justifyContent: 'space-between',
  },
  denseDevoirListMatiereText: {
    maxWidth: '65%',
    paddingRight: 10, // MO-142 use UI_SIZES.spacing here
  },
  denseDevoirListNoteText: {
    ...TextSizeStyle.SlightBig,
    flexGrow: 1,
    textAlign: 'right',
    paddingTop: 6, // MO-142 use UI_SIZES.spacing here
  },
  denseDevoirListDiviseurText: {
    paddingTop: UI_SIZES.spacing.minor,
  },
  gradesDevoirsResumeContainer: {
    padding: UI_SIZES.spacing.minor,
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
    return viescoTheme.palette.presencesEvents.no_reason;
  }
};

const CompetenceRoundModal = (competence: any, index: number, levels: ILevelsList) => (
  <ModalContentBlock style={styleConstant.modalBlock} key={index}>
    <Text style={styleConstant.competenceRoundModalText}>{competence.nom}</Text>
    <View style={[styleConstant.round, { backgroundColor: getColorfromCompetence(competence.evaluation, levels) }]} />
  </ModalContentBlock>
);

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
            <FlatList
              style={styleConstant.competenceRoundModalStyle}
              contentContainerStyle={styleConstant.competenceRoundModalContentStyle}
              showsVerticalScrollIndicator={false}
              data={competences}
              renderItem={({ item, index }) => CompetenceRoundModal(item, index, levels)}
            />
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
  <View
    style={[
      styleConstant.coloredSquare,
      { backgroundColor: backgroundColor ? backgroundColor : theme.palette.complementary.blue.regular },
    ]}>
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
  <FlatList
    contentContainerStyle={styleConstant.gradesDevoirsMoyennesView}
    data={devoirs}
    renderItem={({ item, index }) => (
      <LeftColoredItem color={theme.palette.complementary.blue.regular} key={index}>
        <View style={styleConstant.devoirsList}>
          <View style={styleConstant.gradesDevoirsMoyennesItemView}>
            <TextBold numberOfLines={1}>{item.matiere.toUpperCase()}</TextBold>
            <Text numberOfLines={1}>{item.teacher.toUpperCase()}</Text>
          </View>
          <ColoredSquare hideScore note={item.moyenne} />
        </View>
        {item.devoirs !== undefined
          ? item.devoirs.length > 0 &&
            item.devoirs.map(
              (course, i) =>
                course.is_evaluated && (
                  <View style={styleConstant.subMatieres} key={i}>
                    <Text style={styleConstant.gradesDevoirsMoyennesCourseNameText} numberOfLines={1}>
                      {course.name.toUpperCase()}
                    </Text>
                    {course.note ? (
                      <Text style={{ color: theme.palette.complementary.blue.regular }}>
                        {course.note}/{course.diviseur}
                      </Text>
                    ) : (
                      course.libelle_court && (
                        <Text style={{ color: theme.palette.complementary.blue.regular }}>{course.libelle_court}</Text>
                      )
                    )}
                  </View>
                ),
            )
          : null}
      </LeftColoredItem>
    )}
    ListEmptyComponent={null}
  />
);

export const GradesDevoirs = ({ devoirs, levels, color }: { devoirs: IDevoirList; levels: ILevelsList; color?: boolean }) => (
  <FlatList
    showsVerticalScrollIndicator={false}
    data={devoirs}
    renderItem={({ item, index }) => (
      <View style={styleConstant.devoirsList} key={index}>
        <GradesDevoirsResume devoir={item} />
        <View style={styleConstant.competencesList}>
          {item.note !== undefined && !isNaN(Number(item.note)) ? (
            <>
              {item.competences !== undefined && (
                <CompetenceRound stateFullRound="center" competences={item.competences} size={60} levels={levels} />
              )}
              <ColoredSquare
                note={item.note}
                coeff={item.coefficient}
                moy={item.moyenne}
                diviseur={item.diviseur}
                backgroundColor={
                  color
                    ? getColorFromNote(
                        parseFloat(item.note.replace(/\./g, ',').replace(',', '.')),
                        parseFloat(item.moyenne.replace(/\./g, ',').replace(',', '.')),
                        item.diviseur,
                      )
                    : theme.palette.complementary.blue.regular
                }
              />
            </>
          ) : item.competences !== undefined && item.competences.length ? (
            <CompetenceRound stateFullRound="flex-end" competences={item.competences} size={60} levels={levels} />
          ) : (
            <View style={[styleConstant.coloredSquare, styleConstant.gradeDevoirsNoteContainer]}>
              <TextBold style={styleConstant.gradeDevoirsNoteText}>{item.note}</TextBold>
            </View>
          )}
        </View>
      </View>
    )}
  />
);

export const getSortedEvaluationList = (evaluations: IDevoirList) => {
  return evaluations.sort(
    (a, b) =>
      moment(b.date).diff(moment(a.date)) ||
      String(a.matiere.toLocaleLowerCase() ?? '').localeCompare(b.matiere.toLocaleLowerCase() ?? '') ||
      Number(a.note) - Number(b.note),
  );
};
