import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { FlatList, Platform, RefreshControl, ScrollView, Switch, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import {
  clearCompetencesLevelsAction,
  fetchCompetencesAction,
  fetchCompetencesAveragesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesSubjectsAction,
  fetchCompetencesTermsAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import { AssessmentCard } from '~/framework/modules/viescolaire/competences/components/AssessmentCard';
import { SubjectAverageCard } from '~/framework/modules/viescolaire/competences/components/SubjectAverageCard';
import { IDevoir } from '~/framework/modules/viescolaire/competences/model';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import { concatDevoirs } from '~/framework/modules/viescolaire/competences/service';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { navBarOptions } from '~/framework/navigation/navBar';
import { handleAction, tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { getItemJson, setItemJson } from '~/framework/util/storage';

import styles from './styles';
import type { CompetencesHomeScreenDispatchProps, CompetencesHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CompetencesNavigationParams, typeof competencesRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('competences-home-title'),
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
      if (term !== 'default') {
        await props.tryFetchAverages(structureId, childId, term);
      }
      await props.tryFetchSubjects(structureId);
      let childClasses = classes?.[0];
      if (userType === UserType.Relative) {
        const children = await props.tryFetchUserChildren(structureId, userId);
        childClasses = children.find(c => c.id === childId)?.classId;
      }
      await props.tryFetchDevoirs(structureId, childId, childClasses);
      await props.tryFetchCompetences(childId, childClasses ?? '');
      await props.tryFetchTerms(structureId, childClasses ?? '');
      props.handleClearLevels();
    } catch {
      throw new Error();
    }
  };

  const fetchSubjectAverages = async () => {
    try {
      const { childId, structureId } = props;

      if (!childId || !structureId) throw new Error();
      await props.tryFetchAverages(structureId, childId, term);
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

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchSubjectAverages()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
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

  React.useEffect(() => {
    if (term !== 'default' && subject === 'default') refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, subject]);

  const onTermOpen = React.useCallback(() => {
    setSubjectDropdownOpen(false);
  }, []);

  const onSubjectOpen = React.useCallback(() => {
    setTermDropdownOpen(false);
  }, []);

  const openAssessment = (assessment: IDevoir) => {
    const { childId, classes, navigation, userChildren, userType } = props;
    const studentClass = userType === UserType.Student ? classes?.[0] : userChildren?.find(c => c.id === childId)?.classId;

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
        <SmallText>{I18n.get('competences-home-transcript')}</SmallText>
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
          <SmallBoldText>
            {I18n.get(displaySubjectAverages ? 'competences-home-averages' : 'competences-home-lastgrades')}
          </SmallBoldText>
          {showColorSwitch ? (
            <View style={styles.switchContainer}>
              <SmallText style={styles.colorsText}>{I18n.get('competences-home-colors')}</SmallText>
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
    const { averages, subjects } = props;
    const displaySubjectAverages = term !== 'default' && subject === 'default';
    const devoirs = props.devoirs.filter(devoir => {
      if (term !== 'default' && devoir.termId !== Number(term)) return false;
      if (subject !== 'default' && devoir.subjectId !== subject) return false;
      return true;
    });

    return (
      <>
        {renderHeader()}
        {displaySubjectAverages ? (
          <FlatList
            data={averages}
            keyExtractor={item => item.subjectId}
            renderItem={({ item }) => (
              <SubjectAverageCard
                average={item}
                devoirs={devoirs.filter(d => d.isEvaluated && d.subjectId === item.subjectId).sort((a, b) => a.date.diff(b.date))}
              />
            )}
            ListEmptyComponent={renderEmpty(I18n.get('competences-home-emptyscreen-averages'))}
            contentContainerStyle={styles.listContentContainer}
          />
        ) : (
          <FlatList
            data={devoirs}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <AssessmentCard
                assessment={item}
                hasCompetences={props.competences.some(c => c.devoirId === item.id)}
                subject={subjects.find(s => s.id === item.subjectId)}
                showAverageColor={areAverageColorsShown}
                onPress={() => openAssessment(item)}
              />
            )}
            ListEmptyComponent={renderEmpty(I18n.get('competences-home-emptyscreen-default'))}
            contentContainerStyle={styles.listContentContainer}
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
      case AsyncPagedLoadingState.REFRESH:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
      case AsyncPagedLoadingState.REFRESH_FAILED:
        return renderError();
    }
  };

  return (
    <PageView>
      {props.userType === UserType.Relative ? <ChildPicker contentContainerStyle={styles.childPickerContentContainer} /> : null}
      {renderPage()}
    </PageView>
  );
};

export default connect(
  (state: IGlobalState) => {
    const competencesState = moduleConfig.getState(state);
    const dashboardState = dashboardConfig.getState(state);
    const session = getSession();
    const userId = session?.user.id;
    const userType = session?.user.type;

    return {
      averages: competencesState.averages.data,
      classes: session?.user.classes,
      childId: userType === UserType.Student ? userId : dashboardState.selectedChildId,
      competences: competencesState.competences.data,
      devoirs: concatDevoirs(competencesState.devoirs.data, competencesState.competences.data),
      dropdownItems: {
        terms: [
          { label: I18n.get('competences-home-term'), value: 'default' },
          ...competencesState.terms.data.map(term => ({
            label: `${I18n.get('competences-home-term-' + term.type)} ${term.order}`,
            value: term.typeId.toString(),
          })),
        ],
        subjects: [
          { label: I18n.get('competences-home-subject'), value: 'default' },
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
      structureId:
        userType === UserType.Student ? session?.user.structures?.[0]?.id : getChildStructureId(dashboardState.selectedChildId),
      subjects: competencesState.subjects.data,
      userChildren: competencesState.userChildren.data,
      userId,
      userType,
    };
  },
  dispatch =>
    bindActionCreators<CompetencesHomeScreenDispatchProps>(
      {
        handleClearLevels: handleAction(clearCompetencesLevelsAction),
        tryFetchAverages: tryAction(fetchCompetencesAveragesAction),
        tryFetchCompetences: tryAction(fetchCompetencesAction),
        tryFetchDevoirs: tryAction(fetchCompetencesDevoirsAction),
        tryFetchSubjects: tryAction(fetchCompetencesSubjectsAction),
        tryFetchTerms: tryAction(fetchCompetencesTermsAction),
        tryFetchUserChildren: tryAction(fetchCompetencesUserChildrenAction),
      },
      dispatch,
    ),
)(CompetencesHomeScreen);
