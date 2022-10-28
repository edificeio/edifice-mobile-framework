import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { useState } from 'react';
import { FlexAlignType, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { BodyBoldText, HeadingSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { IDevoir, ILevel, IMoyenne } from '~/modules/viescolaire/competences/reducer';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { ButtonsOkOnly } from '~/ui/ButtonsOkCancel';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

// STYLE

const styles = StyleSheet.create({
  coloredSquareText: { color: theme.palette.grey.white },
  devoirsList: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 5,
    backgroundColor: theme.palette.grey.white,
    marginBottom: UI_SIZES.spacing.small,
  },
  competencesList: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    maxWidth: '50%',
  },
  coloredSquare: {
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: 5,
    padding: UI_SIZES.spacing.minor,
    minWidth: '29%',
  },
  coloredSquareNoteTextContainer: {
    alignSelf: 'center',
    color: theme.palette.grey.white,
    marginVertical: UI_SIZES.spacing.minor,
  },
  coloredSquareNoteText: {
    color: theme.palette.grey.white,
  },
  gradeDevoirsNoteContainer: {
    justifyContent: 'center',
  },
  gradeDevoirsNoteText: {
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
    textAlign: 'center',
  },
  competenceRoundModalStyle: {
    width: '100%',
  },
  competenceRoundModalContentStyle: {
    marginLeft: -UI_SIZES.spacing.medium,
    marginRight: UI_SIZES.spacing.medium,
  },
  competenceRoundModalText: {
    width: '85%',
  },
  round: {
    marginLeft: UI_SIZES.spacing.tiny,
    height: 25,
    width: 25,
    borderRadius: UI_SIZES.spacing.medium,
  },
  subMatieres: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  shadow: {
    shadowColor: theme.ui.shadowColor,
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
    marginBottom: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.minor,
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
    paddingRight: UI_SIZES.spacing.minor,
  },
  denseDevoirListNoteText: {
    flexGrow: 1,
    textAlign: 'right',
    alignSelf: 'center',
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

const getColorfromCompetence = (evaluation: number, levels: ILevel[]) => {
  const cycleLevels = levels.filter(obj => {
    return obj.cycle === 'Cycle 3';
  });
  if (evaluation >= 0 && evaluation < cycleLevels.length) {
    const color = cycleLevels[evaluation].couleur;
    return color ? color : cycleLevels[evaluation].default;
  }
  return theme.palette.grey.cloudy;
};

const getColorFromNote = (note: number, moy: number, diviseur: number) => {
  if (note === diviseur || note > moy) {
    return theme.palette.complementary.green.regular;
  } else if (note === moy) {
    return theme.palette.complementary.orange.regular;
  } else if (note < moy) {
    return viescoTheme.palette.presencesEvents.noReason;
  }
};

const CompetenceRoundModal = (competence: any, index: number, levels: ILevel[]) => (
  <ModalContentBlock style={styles.modalBlock} key={index}>
    <SmallText style={styles.competenceRoundModalText}>{competence.nom}</SmallText>
    <View style={[styles.round, { backgroundColor: getColorfromCompetence(competence.evaluation, levels) }]} />
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
  levels: ILevel[];
}) => {
  const [isVisible, toggleVisible] = useState(false);
  return (
    <View
      style={[
        styles.competenceRoundContainer,
        stateFullRound === 'flex-end' ? styles.competenceRoundContainerWidthAuto : styles.competenceRoundContainerWidthQuarter,
        { alignItems: stateFullRound },
      ]}>
      {competences.length > 0 && (
        <TouchableOpacity
          style={[styles.competenceRound, styles.shadow, { minHeight: size, minWidth: size }]}
          onPress={() => toggleVisible(!isVisible)}>
          <HeadingSText style={styles.competenceRoundText}>C</HeadingSText>
        </TouchableOpacity>
      )}

      {isVisible && (
        <ModalBox isVisible={isVisible}>
          <ModalContent>
            <FlatList
              style={styles.competenceRoundModalStyle}
              contentContainerStyle={styles.competenceRoundModalContentStyle}
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
      styles.coloredSquare,
      { backgroundColor: backgroundColor ? backgroundColor : theme.palette.complementary.blue.regular },
    ]}>
    <SmallText style={styles.coloredSquareNoteTextContainer}>
      {!isNaN(Number(note)) ? (
        <>
          <HeadingSText style={styles.coloredSquareNoteText}>{+parseFloat(Number(note).toFixed(2))}</HeadingSText>
          {!hideScore ? `/ ${diviseur}` : null}
        </>
      ) : (
        <HeadingSText style={styles.coloredSquareNoteText}>{note}</HeadingSText>
      )}
    </SmallText>
    {coeff ? <SmallText style={styles.coloredSquareText}>coeff : {coeff}</SmallText> : null}
    {moy ? <SmallText style={styles.coloredSquareText}>moy : {moy}</SmallText> : null}
  </View>
);

const GradesDevoirsResume = ({ devoir }: { devoir: IDevoir }) => (
  <View style={styles.gradesDevoirsResumeContainer}>
    <SmallBoldText numberOfLines={1}>{devoir.matiere.toUpperCase()}</SmallBoldText>
    <SmallText numberOfLines={1}>{devoir.teacher.toUpperCase()}</SmallText>
    <SmallText numberOfLines={1}>{devoir.title}</SmallText>
    <SmallText>{moment(devoir.date).format('L')}</SmallText>
  </View>
);

// EXPORTED COMPONENTS

export const DenseDevoirList = ({ devoirs, levels }: { devoirs: IDevoir[]; levels: ILevel[] }) => (
  <>
    {devoirs.map((devoir, index) => (
      <LeftColoredItem shadow color={viescoTheme.palette.competences} key={index}>
        <View style={styles.denseDevoirListContainer}>
          <View style={styles.denseDevoirListMatiereContainer}>
            <SmallBoldText style={styles.denseDevoirListMatiereText} numberOfLines={1}>
              {devoir.matiere}
            </SmallBoldText>
            <SmallText>{moment(devoir.date).format('L')}</SmallText>
          </View>
          {devoir.competences.length ? (
            <CompetenceRound stateFullRound="flex-end" competences={devoir.competences} size={35} levels={levels} />
          ) : (
            isNaN(Number(devoir.note)) && <BodyBoldText style={styles.denseDevoirListNoteText}>{devoir.note}</BodyBoldText>
          )}
          {devoir.note && !isNaN(Number(devoir.note)) && (
            <>
              <BodyBoldText style={styles.denseDevoirListNoteText}>{devoir.note.replace(/\./g, ',')}</BodyBoldText>
              <SmallText style={styles.denseDevoirListDiviseurText}>/{devoir.diviseur}</SmallText>
            </>
          )}
        </View>
      </LeftColoredItem>
    ))}
  </>
);

export const GradesDevoirsMoyennes = ({ devoirs }: { devoirs: IMoyenne[] }) => (
  <FlatList
    contentContainerStyle={styles.gradesDevoirsMoyennesView}
    data={devoirs}
    renderItem={({ item, index }) => (
      <LeftColoredItem color={theme.palette.complementary.blue.regular} key={index}>
        <View style={styles.devoirsList}>
          <View style={styles.gradesDevoirsMoyennesItemView}>
            <SmallBoldText numberOfLines={1}>{item.matiere.toUpperCase()}</SmallBoldText>
            <SmallText numberOfLines={1}>{item.teacher.toUpperCase()}</SmallText>
          </View>
          <ColoredSquare hideScore note={item.moyenne} />
        </View>
        {item.devoirs !== undefined
          ? item.devoirs.length > 0 &&
            item.devoirs.map(
              (course, i) =>
                course.is_evaluated && (
                  <View style={styles.subMatieres} key={i}>
                    <SmallText style={styles.gradesDevoirsMoyennesCourseNameText} numberOfLines={1}>
                      {course.name.toUpperCase()}
                    </SmallText>
                    {course.note ? (
                      <SmallText style={{ color: theme.palette.complementary.blue.regular }}>
                        {course.note}/{course.diviseur}
                      </SmallText>
                    ) : (
                      course.libelle_court && (
                        <SmallText style={{ color: theme.palette.complementary.blue.regular }}>{course.libelle_court}</SmallText>
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

export const GradesDevoirs = ({ devoirs, levels, color }: { devoirs: IDevoir[]; levels: ILevel[]; color?: boolean }) => (
  <FlatList
    showsVerticalScrollIndicator={false}
    data={devoirs}
    renderItem={({ item, index }) => (
      <View style={styles.devoirsList} key={index}>
        <GradesDevoirsResume devoir={item} />
        <View style={styles.competencesList}>
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
            <View style={[styles.coloredSquare, styles.gradeDevoirsNoteContainer]}>
              <HeadingSText style={styles.gradeDevoirsNoteText}>{item.note}</HeadingSText>
            </View>
          )}
        </View>
      </View>
    )}
  />
);

export const getSortedEvaluationList = (evaluations: IDevoir[]) => {
  return evaluations.sort(
    (a, b) =>
      moment(b.date).diff(moment(a.date)) ||
      String(a.matiere.toLocaleLowerCase() ?? '').localeCompare(b.matiere.toLocaleLowerCase() ?? '') ||
      Number(a.note) - Number(b.note),
  );
};
