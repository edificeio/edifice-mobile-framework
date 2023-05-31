import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, Platform, RefreshControl, ScrollView, Switch, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import {
  fetchCompetencesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesDomainesAction,
  fetchCompetencesLevelsAction,
  fetchCompetencesSubjectsAction,
  fetchCompetencesTermsAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import { AssessmentCard } from '~/framework/modules/viescolaire/competences/components/AssessmentCard';
import { SubjectAverageCard } from '~/framework/modules/viescolaire/competences/components/SubjectAverageCard';
import { IDevoir } from '~/framework/modules/viescolaire/competences/model';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { getItemJson, setItemJson } from '~/framework/util/storage';

import styles from './styles';
import type { CompetencesHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CompetencesNavigationParams, typeof competencesRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('viesco-tests'),
  }),
});

const CompetencesHomeScreen = (props: CompetencesHomeScreenPrivateProps) => {
  const [isTermDropdownOpen, setTermDropdownOpen] = React.useState<boolean>(false);
  const [isSubjectDropdownOpen, setSubjectDropdownOpen] = React.useState<boolean>(false);
  const [term, setTerm] = React.useState<string>('default');
  const [subject, setSubject] = React.useState<string>('default');
  const STORAGE_KEY = `${moduleConfig.name}.showAverageColors`;
  const [areAverageColorsShown, setAverageColorsShown] = React.useState<boolean>(false);

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchAssessments = async () => {
    try {
      const { childId, classes, structureId, userId, userType } = props;

      if (!childId || !structureId || !userId || !userType) throw new Error();
      getItemJson<boolean>(STORAGE_KEY).then(value => {
        if (value) setAverageColorsShown(true);
      });
      await props.fetchDevoirs(structureId, childId);
      await props.fetchSubjects(structureId);
      let childClasses = classes?.[0];
      if (userType === UserType.Relative) {
        const children = await props.fetchUserChildren(structureId, userId);
        childClasses = children.find(c => c.id === childId)?.idClasse;
      }
      await props.fetchTerms(structureId, childClasses ?? '');
      await props.fetchCompetences(childId, childClasses ?? '');
      await props.fetchDomaines(childClasses ?? '');
      await props.fetchLevels(structureId);
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchAssessments()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchAssessments()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    if (loadingState === AsyncPagedLoadingState.DONE) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.childId]);

  const onTermOpen = React.useCallback(() => {
    setSubjectDropdownOpen(false);
  }, []);

  const onSubjectOpen = React.useCallback(() => {
    setTermDropdownOpen(false);
  }, []);

  const openAssessment = (assessment: IDevoir) => {
    const { childId, classes, navigation, userChildren, userType } = props;
    const studentClass = userType === UserType.Student ? classes?.[0] : userChildren?.find(c => c.id === childId)?.idClasse;

    navigation.navigate(competencesRouteNames.assessment, {
      assessment,
      studentClass: studentClass ?? '',
    });
  };

  const renderEmpty = (title: string) => {
    return <EmptyScreen svgImage="empty-evaluations" title={title} />;
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderHeader = () => {
    const { terms, subjects } = props.dropdownItems;
    const displaySubjectAverages = term !== 'default' && subject === 'default';
    const showColorSwitch = !displaySubjectAverages && props.devoirs.some(devoir => !isNaN(Number(devoir.note)));

    return (
      <View style={styles.headerContainer}>
        <SmallText>{I18n.t('viesco-report-card')}</SmallText>
        <View style={styles.dropdownsContainer}>
          <DropDownPicker
            open={isTermDropdownOpen}
            value={term}
            items={terms}
            setOpen={setTermDropdownOpen}
            setValue={setTerm}
            onOpen={onTermOpen}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdown}
            textStyle={styles.dropdownText}
            containerStyle={[UI_STYLES.flex1, styles.dropdownMargin]}
          />
          <DropDownPicker
            open={isSubjectDropdownOpen}
            value={subject}
            items={subjects}
            setOpen={setSubjectDropdownOpen}
            setValue={setSubject}
            onOpen={onSubjectOpen}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdown}
            textStyle={styles.dropdownText}
            containerStyle={UI_STYLES.flex1}
          />
        </View>
        <View style={styles.headerRow}>
          <SmallBoldText>{I18n.t(displaySubjectAverages ? 'viesco-average' : 'viesco-last-grades')}</SmallBoldText>
          {showColorSwitch ? (
            <View style={styles.switchContainer}>
              <SmallText style={styles.colorsText}>{I18n.t('viesco-colors')}</SmallText>
              <Switch
                value={areAverageColorsShown}
                onValueChange={() => {
                  setAverageColorsShown(!areAverageColorsShown);
                  setItemJson(STORAGE_KEY, !areAverageColorsShown);
                }}
                trackColor={{ false: theme.palette.grey.grey, true: theme.palette.complementary.green.regular }}
                style={Platform.OS !== 'ios' ? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : null}
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderAssessments = () => {
    const { competences, domaines, levels, subjects } = props;
    const displaySubjectAverages = term !== 'default' && subject === 'default';
    const devoirs = props.devoirs.filter(devoir => {
      if (term !== 'default' && term !== 'year' && devoir.termId !== Number(term)) return false;
      if (subject !== 'default' && devoir.subjectId !== subject) return false;
      return true;
    });

    return (
      <>
        {renderHeader()}
        {displaySubjectAverages ? (
          <FlatList
            data={subjects
              .map(s => ({
                id: s.id,
                name: s.name,
                devoirs: devoirs.filter(d => d.isEvaluated && d.subjectId === s.id),
              }))
              .filter(i => i.devoirs.length)}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <SubjectAverageCard devoirs={item.devoirs} name={item.name} />}
            ListEmptyComponent={renderEmpty(I18n.t('viesco-empty-subject-averages'))}
            style={styles.listContainer}
          />
        ) : (
          <FlatList
            data={devoirs}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <AssessmentCard
                assessment={item}
                competences={competences.filter(competence => competence.devoirId === item.id)}
                domaines={domaines}
                levels={levels}
                subject={subjects.find(s => s.id === item.subjectId)}
                showAverageColor={areAverageColorsShown}
                onPress={() => openAssessment(item)}
              />
            )}
            ListEmptyComponent={renderEmpty(I18n.t('viesco-eval-EmptyScreenText'))}
            style={styles.listContainer}
          />
        )}
      </>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderAssessments();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return (
    <PageView>
      {props.userType === UserType.Relative ? <ChildPicker /> : null}
      {renderPage()}
    </PageView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const competencesState = moduleConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      classes: session?.user.classes,
      competences: competencesState.competences.data,
      childId: userType === UserType.Student ? userId : getSelectedChild(state)?.id,
      devoirs: competencesState.devoirs.data,
      domaines: competencesState.domaines.data,
      dropdownItems: {
        terms: [
          { label: I18n.t('viesco-competences-period'), value: 'default' },
          ...competencesState.terms.data.map(term => ({
            label: `${I18n.t('viesco-competences-period-' + term.type)} ${term.order}`,
            value: term.typeId.toString(),
          })),
          { label: I18n.t('viesco-year'), value: 'year' },
        ],
        subjects: [
          { label: I18n.t('viesco-competences-subject'), value: 'default' },
          ...competencesState.subjects.data
            .filter(subject => competencesState.devoirs.data.some(devoir => devoir.subjectId === subject.id))
            .map(subject => ({
              label: subject.name,
              value: subject.id,
            })),
        ],
      },
      initialLoadingState:
        competencesState.devoirs.isPristine || competencesState.subjects.isPristine
          ? AsyncPagedLoadingState.PRISTINE
          : AsyncPagedLoadingState.DONE,
      levels: competencesState.levels.data,
      structureId: userType === UserType.Student ? session?.user.structures?.[0]?.id : getSelectedChildStructure(state)?.id,
      subjects: competencesState.subjects.data,
      userChildren: competencesState.userChildren.data,
      userId,
      userType,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchCompetences: tryActionLegacy(
          fetchCompetencesAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchCompetences'],
        fetchDevoirs: tryActionLegacy(
          fetchCompetencesDevoirsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchDevoirs'],
        fetchDomaines: tryActionLegacy(
          fetchCompetencesDomainesAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchDomaines'],
        fetchLevels: tryActionLegacy(
          fetchCompetencesLevelsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchLevels'],
        fetchSubjects: tryActionLegacy(
          fetchCompetencesSubjectsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchSubjects'],
        fetchTerms: tryActionLegacy(
          fetchCompetencesTermsAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchTerms'],
        fetchUserChildren: tryActionLegacy(
          fetchCompetencesUserChildrenAction,
          undefined,
          true,
        ) as unknown as CompetencesHomeScreenPrivateProps['fetchUserChildren'],
      },
      dispatch,
    ),
)(CompetencesHomeScreen);
