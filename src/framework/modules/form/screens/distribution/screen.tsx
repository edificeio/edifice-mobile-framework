import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import React from 'react';
import { Alert, FlatList, Platform, RefreshControl, ScrollView, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { HeadingSText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { fetchDistributionResponsesAction, fetchFormContentAction } from '~/framework/modules/form/actions';
import { FormSectionCard } from '~/framework/modules/form/components/FormSectionCard';
import FormSubmissionModal from '~/framework/modules/form/components/FormSubmissionModal';
import { getQuestionCard } from '~/framework/modules/form/components/question-cards';
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
} from '~/framework/modules/form/model';
import moduleConfig from '~/framework/modules/form/module-config';
import { FormNavigationParams, formRouteNames } from '~/framework/modules/form/navigation';
import { formService } from '~/framework/modules/form/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { FormDistributionScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<FormNavigationParams, typeof formRouteNames.distribution>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: route.params.title,
});

const FormDistributionScreen = (props: FormDistributionScreenPrivateProps) => {
  const { id: distributionId, editable, formId, status } = props.route.params;
  const [hasResponderRight, setHasResponderRight] = React.useState(true);
  const [position, setPosition] = React.useState(0);
  const [positionHistory, setPositionHistory] = React.useState<number[]>([]);
  const [responses, setResponses] = React.useState<IQuestionResponse[]>([]);
  const flatListRef = React.useRef<FlatList>(null);
  const modalBoxRef = React.useRef<ModalBoxHandle>(null);
  const isPositionAtSummary = position === props.elementsCount;
  const listElements = isPositionAtSummary ? formatSummary(props.elements, responses) : formatElement(props.elements[position]);
  const isMandatoryAnswerMissing = getIsMandatoryAnswerMissing(listElements, responses);

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchDistribution = async () => {
    try {
      const { session } = props;

      if (!session) throw new Error();
      if (!(await formService.form.hasResponderRight(session, formId))) {
        setHasResponderRight(false);
        return;
      }
      const content = await props.fetchFormContent(formId);
      const res = await props.fetchDistributionResponses(distributionId);
      setResponses(res);
      if (content.elementsCount && status !== DistributionStatus.TO_DO) {
        setPosition(content.elementsCount);
        setPositionHistory(getPositionHistory(content.elements, res));
      }
    } catch {
      throw new Error();
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

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  React.useEffect(() => {
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [position]);

  const updateQuestionResponses = (questionId: number, newResponses: IQuestionResponse[]) => {
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
      const { session } = props;
      const questions = listElements.filter(e => !getIsElementSection(e)) as IQuestion[];

      if (!session) throw new Error();
      for (const question of questions) {
        let res = responses.filter(r => r.questionId === question.id);
        // Delete responses of multiple answer and matrix questions
        if (question.type === QuestionType.MULTIPLEANSWER) {
          // AMV2-465 temporary fix until form web 1.6.0
          const unselectedResponses = res.filter(r => r.toDelete);
          await formService.responses.delete(session, formId, unselectedResponses);
          res = res.filter(r => !r.toDelete);
          updateQuestionResponses(question.id, res);
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
                  updateQuestionResponses(id, [response]);
                });
            }),
          );
        }
      }
    } catch {
      throw new Error();
    }
  };

  const saveChanges = async () => {
    try {
      await postResponsesChanges();
      Toast.showSuccess(I18n.t('form.answersWellSaved'), { ...UI_ANIMATIONS.toast });
    } catch {
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
      const { session } = props;
      const structure = props.structures.find(s => s.value === structureId);

      if (!session) throw new Error();
      const distribution = await formService.distribution.get(session, distributionId);
      distribution.structure = structure?.label;
      if (status === DistributionStatus.TO_DO) {
        distribution.status = DistributionStatus.FINISHED;
        await formService.distribution.put(session, distribution);
      } else if (distribution.originalId) {
        await formService.distribution.replace(session, distributionId, distribution.originalId);
      }
      modalBoxRef.current?.doDismissModal();
      props.navigation.goBack();
      Toast.showSuccess(I18n.t('form.answersSent'), { ...UI_ANIMATIONS.toast });
    } catch {
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const renderEmpty = () => {
    return <EmptyScreen svgImage="empty-form-access" title={I18n.t('form.formDistributionScreen.emptyScreen.title')} />;
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
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
        onChangeAnswer={updateQuestionResponses}
        onEditQuestion={onEditQuestion}
      />
    );
  };

  const renderPositionActions = () => {
    if (isPositionAtSummary) {
      return status !== DistributionStatus.FINISHED || editable ? (
        <ActionButton text={I18n.t('form.finishAndSend')} action={() => modalBoxRef.current?.doShowModal()} />
      ) : null;
    }
    return (
      <View style={styles.actionsContainer}>
        {positionHistory.length ? <ActionButton text={I18n.t('previous')} type="secondary" action={goToPreviousPosition} /> : null}
        <ActionButton text={I18n.t('next')} action={goToNextPosition} disabled={isMandatoryAnswerMissing} />
      </View>
    );
  };

  const renderDistribution = () => {
    return hasResponderRight ? (
      <>
        <FlatList
          ref={flatListRef}
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
          ref={modalBoxRef}
          editable={editable}
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
        return renderDistribution();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  UNSTABLE_usePreventRemove(status !== DistributionStatus.FINISHED && loadingState === AsyncPagedLoadingState.DONE, ({ data }) => {
    Alert.alert(I18n.t('form.formDistributionScreen.leaveAlert.title'), I18n.t('form.formDistributionScreen.leaveAlert.message'), [
      {
        text: I18n.t('common.cancel'),
        style: 'cancel',
      },
      {
        text: I18n.t('common.quit'),
        onPress: async () => {
          await saveChanges();
          props.navigation.dispatch(data.action);
        },
        style: 'destructive',
      },
    ]);
  });

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect(
  (state: IGlobalState) => {
    const formState = moduleConfig.getState(state);
    const session = getSession();

    return {
      elements: formState.formContent.data.elements,
      elementsCount: formState.formContent.data.elementsCount,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      session,
      structures:
        session?.user.structures?.map(school => {
          return {
            label: school.name,
            value: school.id,
          };
        }) ?? [],
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        fetchDistributionResponses: tryActionLegacy(
          fetchDistributionResponsesAction,
          undefined,
          true,
        ) as unknown as FormDistributionScreenPrivateProps['fetchDistributionResponses'],
        fetchFormContent: tryActionLegacy(
          fetchFormContentAction,
          undefined,
          true,
        ) as unknown as FormDistributionScreenPrivateProps['fetchFormContent'],
      },
      dispatch,
    ),
)(FormDistributionScreen);
