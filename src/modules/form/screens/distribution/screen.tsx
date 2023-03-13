import I18n from 'i18n-js';
import React from 'react';
import { Platform, RefreshControl, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { HeadingSText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { getUserSession } from '~/framework/util/session';
import { fetchDistributionResponsesAction, fetchFormContentAction } from '~/modules/form/actions';
import { FormSectionCard } from '~/modules/form/components/FormSectionCard';
import { FormSubmissionModal } from '~/modules/form/components/FormSubmissionModal';
import { getQuestionCard } from '~/modules/form/components/questionCards';
import moduleConfig from '~/modules/form/moduleConfig';
import {
  DistributionStatus,
  IFormElement,
  IQuestion,
  IQuestionResponse,
  QuestionType,
  formatElement,
  formatSummary,
  getIsElementSection,
  getIsMandatoryAnswerMissing,
  getPositionHistory,
} from '~/modules/form/reducer';
import { formService } from '~/modules/form/service';

import styles from './styles';
import { IFormDistributionScreenProps } from './types';

const FormDistributionScreen = (props: IFormDistributionScreenProps) => {
  const distributionId = props.navigation.getParam('id');
  const editable = props.navigation.getParam('editable');
  const formId = props.navigation.getParam('formId');
  const status = props.navigation.getParam('status');
  const [hasResponderRight, setHasResponderRight] = React.useState(true);
  const [position, setPosition] = React.useState(0);
  const [positionHistory, setPositionHistory] = React.useState<number[]>([]);
  const [responses, setResponses] = React.useState<IQuestionResponse[]>([]);
  const flatListRef = React.useRef<typeof FlatList>();
  const modalRef: { current: any } = React.createRef();
  const isPositionAtSummary = position === props.elementsCount;
  const listElements = isPositionAtSummary ? formatSummary(props.elements, responses) : formatElement(props.elements[position]);
  const isMandatoryAnswerMissing = getIsMandatoryAnswerMissing(listElements, responses);

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchDistribution = async () => {
    try {
      const session = getUserSession();
      if (!(await formService.form.hasResponderRight(session, formId))) {
        setHasResponderRight(false);
        return;
      }
      const content = await props.fetchFormContent(formId);
      if (content) {
        const res = await props.fetchDistributionResponses(distributionId);
        setResponses(res);
        if (content?.elementsCount && status !== DistributionStatus.TO_DO) {
          setPosition(content.elementsCount);
          setPositionHistory(getPositionHistory(content.elements, res));
        }
      }
    } catch (e) {
      throw e;
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchDistribution()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchDistribution()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
  };

  const focusEventListener = React.useRef<NavigationEventSubscription>();
  React.useEffect(() => {
    focusEventListener.current = props.navigation.addListener('didFocus', () => {
      fetchOnNavigation();
    });
    return () => {
      focusEventListener.current?.remove();
    };
  }, []);

  React.useEffect(() => {
    flatListRef.current?.scrollToOffset({ x: 0, y: 0, animated: false });
  }, [position]);

  const updateResponses = (questionId: number, newResponses: IQuestionResponse[]) => {
    const res = responses.filter(response => response.questionId !== questionId);
    res.push(...newResponses);
    setResponses(res);
  };

  const setPositionToQuestion = (question: IQuestion) => {
    let pos = 0;
    if (question.position) {
      pos = question.position - 1;
    } else {
      const section = props.elements.find(element => element.id === question.sectionId);
      if (section && section.position) {
        pos = section.position - 1;
      }
    }
    const index = positionHistory.indexOf(pos);
    if (index !== -1) {
      setPositionHistory(positionHistory.slice(0, index));
    }
    setPosition(pos);
  };

  const postResponsesChanges = async () => {
    try {
      const questions = listElements.filter(e => !getIsElementSection(e)) as IQuestion[];
      const session = getUserSession();
      for (const question of questions) {
        let res = responses.filter(r => r.questionId === question.id);
        // Delete responses of multiple answer and matrix questions
        if (question.type === QuestionType.MULTIPLEANSWER) {
          // AMV2-465 temporary fix until form web 1.6.0
          const unselectedResponses = res.filter(r => r.toDelete);
          await formService.responses.delete(session, formId, unselectedResponses);
          res = res.filter(r => !r.toDelete);
          updateResponses(question.id, res);
          //await formService.distribution.deleteQuestionResponses(session, distributionId, question.id);
          //res.map(r => (r.id = undefined));
        } else if (question.type === QuestionType.MATRIX) {
          // AMV2-465 temporary fix until form web 1.6.0
          const questionIds = question.children!.map(q => q.id);
          //await Promise.all(questionIds.map(id => formService.distribution.deleteQuestionResponses(session, distributionId, id)));
          res = responses.filter(r => questionIds?.includes(r.questionId));
          //res.map(r => (r.id = undefined));
        }
        await Promise.all(
          res.map(response => {
            if (response.id) {
              return formService.response.put(
                session,
                response.id,
                distributionId,
                response.questionId,
                response.choiceId ?? null,
                response.answer,
                response.customAnswer ?? null,
              );
            } else {
              return formService.question
                .createResponse(session, response.questionId, distributionId, response.choiceId ?? null, response.answer)
                .then(r => (response.id = r.id));
            }
          }),
        );
        if (question.type === QuestionType.FILE && res[0]?.files?.some(f => f.lf)) {
          const response = res[0];
          await formService.response.deleteFiles(session, response.id!);
          await Promise.all(
            response.files!.map(file => {
              if (file.lf) {
                return formService.response.addFile(session, response.id!, file.lf);
              }
            }),
          );
        }
        // Add empty response to unanswered question
        if (!res.length) {
          const questionIds = question.type === QuestionType.MATRIX ? question.children!.map(q => q.id) : [question.id];
          await Promise.all(
            questionIds.map(id => {
              const response: IQuestionResponse = {
                questionId: id,
                answer: '',
              };
              return formService.question
                .createResponse(session, response.questionId, distributionId, null, response.answer)
                .then(r => {
                  response.id = r.id;
                  updateResponses(id, [response]);
                });
            }),
          );
        }
      }
    } catch (e) {
      throw e;
    }
  };

  const onSave = async () => {
    try {
      await postResponsesChanges();
      Toast.showSuccess(I18n.t('form.answersWellSaved'), { ...UI_ANIMATIONS.toast });
    } catch (e) {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const goToPreviousPosition = () => {
    postResponsesChanges();
    const history = positionHistory;
    setPosition(history[history.length - 1]);
    history.pop();
    setPositionHistory(history);
  };

  const updatePosition = (newPosition: number) => {
    setPositionHistory([...positionHistory, position]);
    setPosition(newPosition);
  };

  const goToNextPosition = () => {
    postResponsesChanges();
    const conditionalQuestion = listElements.find(e => !getIsElementSection(e) && (e as IQuestion).conditional) as IQuestion;
    if (conditionalQuestion) {
      const res = responses.find(r => r.questionId === conditionalQuestion.id);
      const sectionId = conditionalQuestion.choices.find(c => c.id === res?.choiceId)?.nextSectionId;
      if (sectionId === null) {
        return updatePosition(props.elementsCount);
      }
      const sectionPosition = props.elements.find(e => getIsElementSection(e) && e.id === sectionId)?.position;
      if (sectionPosition) {
        return updatePosition(sectionPosition - 1);
      }
    }
    updatePosition(position + 1);
  };

  const submitDistribution = async (structureId: string) => {
    try {
      const session = getUserSession();
      const structure = props.structures.find(s => s.value === structureId);
      const distribution = await formService.distribution.get(session, distributionId);
      distribution.structure = structure?.label;
      if (status === DistributionStatus.TO_DO) {
        distribution.status = DistributionStatus.FINISHED;
        await formService.distribution.put(session, distribution);
      } else if (distribution.originalId) {
        await formService.distribution.replace(session, distributionId, distribution.originalId);
      }
      modalRef?.current?.doDismissModal();
      props.navigation.dispatch(NavigationActions.back());
      Toast.showSuccess(I18n.t('form.answersSent'), { ...UI_ANIMATIONS.toast });
    } catch (e) {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const navBarInfo = {
    title: props.navigation.getParam('title'),
    right:
      loadingRef.current === AsyncPagedLoadingState.DONE && !isPositionAtSummary ? (
        <TouchableOpacity onPress={() => onSave()} style={styles.saveActionContainer}>
          <Picture type="NamedSvg" name="ui-save" fill={theme.ui.text.inverse} width={24} height={24} />
        </TouchableOpacity>
      ) : undefined,
  };

  const renderEmpty = () => {
    return <EmptyScreen svgImage="empty-form-access" title={I18n.t('form.formDistributionScreen.emptyScreen.title')} />;
  };

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderSummaryHeading = () => {
    return isPositionAtSummary ? <HeadingSText style={styles.summaryText}>{I18n.t('form.summary')}</HeadingSText> : null;
  };

  const renderElement = (item: IFormElement) => {
    if (!('type' in item)) {
      const { title, description } = item;
      return <FormSectionCard title={title} description={description} />;
    }
    let questionResponses = responses.filter(response => response.questionId === item.id);
    if (item.type === QuestionType.MATRIX) {
      const childIds = item.children?.map(child => child.id);
      questionResponses = responses.filter(response => childIds?.includes(response.questionId));
    }
    const FormQuestionCard = getQuestionCard(item.type);
    const onEditQuestion =
      isPositionAtSummary && (status !== DistributionStatus.FINISHED || editable)
        ? () => setPositionToQuestion(item as IQuestion)
        : undefined;
    return (
      <FormQuestionCard
        question={item}
        responses={questionResponses}
        isDisabled={isPositionAtSummary}
        onChangeAnswer={updateResponses}
        onEditQuestion={onEditQuestion}
      />
    );
  };

  const renderPositionActions = () => {
    if (isPositionAtSummary) {
      return status !== DistributionStatus.FINISHED || editable ? (
        <ActionButton text={I18n.t('form.finishAndSend')} action={() => modalRef?.current?.doShowModal()} />
      ) : null;
    }
    return (
      <View style={styles.actionsContainer}>
        {positionHistory.length ? (
          <ActionButton
            text={I18n.t('back')}
            type="secondary"
            action={() => goToPreviousPosition()}
            style={styles.positionActionContainer}
          />
        ) : null}
        <ActionButton
          text={I18n.t('next')}
          action={() => goToNextPosition()}
          disabled={isMandatoryAnswerMissing}
          style={styles.positionActionContainer}
        />
      </View>
    );
  };

  const renderDistribution = () => {
    return hasResponderRight ? (
      <>
        <FlatList
          ref={ref => {
            flatListRef.current = ref;
          }}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          data={listElements}
          keyExtractor={element => (getIsElementSection(element) ? 's' : 'q') + element.id.toString()}
          renderItem={({ item }) => renderElement(item)}
          ListHeaderComponent={renderSummaryHeading()}
          ListFooterComponent={renderPositionActions()}
          ListFooterComponentStyle={styles.listFooterContainer}
          contentContainerStyle={styles.listContainer}
        />
        <FormSubmissionModal
          editable={editable}
          modalBoxRef={modalRef}
          status={status}
          structures={props.structures}
          onSubmit={submitDistribution}
        />
      </>
    ) : (
      renderEmpty()
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderDistribution();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  const PageComponent = Platform.select({ ios: KeyboardPageView, android: PageView })!;

  return (
    <PageComponent navigation={props.navigation} navBarWithBack={navBarInfo} safeArea={false}>
      {renderPage()}
    </PageComponent>
  );
};

export default connect(
  (gs: IGlobalState) => {
    const state = moduleConfig.getState(gs);
    return {
      elements: state.formContent.data.elements,
      elementsCount: state.formContent.data.elementsCount,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      session: getUserSession(),
      structures: gs.user.info.schools.map(school => {
        return {
          label: school.name,
          value: school.id,
        };
      }),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchDistributionResponses: tryAction(fetchDistributionResponsesAction, undefined, true),
        fetchFormContent: tryAction(fetchFormContentAction, undefined, true),
      },
      dispatch,
    ),
)(FormDistributionScreen);
