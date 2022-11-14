import I18n from 'i18n-js';
import React from 'react';
import { Alert, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import FlatList from '~/framework/components/flatList';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { HeadingSText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { fetchDistributionResponsesAction, fetchFormContentAction } from '~/modules/form/actions';
import { FormSectionCard } from '~/modules/form/components/FormSectionCard';
import { getQuestionCard } from '~/modules/form/components/questionCards';
import moduleConfig from '~/modules/form/moduleConfig';
import {
  DistributionStatus,
  IFormContent,
  IFormElement,
  IQuestion,
  IQuestionResponse,
  ISection,
  QuestionType,
  formatElement,
  formatSummary,
  getIsElementSection,
  getIsMandatoryAnswerMissing,
  getPositionHistory,
} from '~/modules/form/reducer';
import { formService } from '~/modules/form/service';

const styles = StyleSheet.create({
  saveActionContainer: {
    height: '100%',
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
  },
  summaryText: {
    alignSelf: 'center',
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.small,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  listFooterContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: UI_SIZES.spacing.medium,
  },
});

// TYPES ==========================================================================================

interface IFormDistributionScreen_DataProps {
  elements: IFormElement[];
  elementsCount: number;
  initialLoadingState: AsyncPagedLoadingState;
  session: IUserSession;
}

interface IFormDistributionScreen_EventProps {
  fetchDistributionResponses: (distributionId: number) => Promise<IQuestionResponse[]>;
  fetchFormContent: (formId: number) => Promise<IFormContent | undefined>;
  dispatch: ThunkDispatch<any, any, any>;
}

interface IFormDistributionScreen_NavigationParams {
  editable: boolean;
  formId: number;
  id: number;
  status: DistributionStatus;
  title: string;
}

type IFormDistributionScreen_Props = IFormDistributionScreen_DataProps &
  IFormDistributionScreen_EventProps &
  NavigationInjectedProps<IFormDistributionScreen_NavigationParams>;

// COMPONENT ======================================================================================

const FormDistributionScreen = (props: IFormDistributionScreen_Props) => {
  const distributionId = props.navigation.getParam('id');
  const editable = props.navigation.getParam('editable');
  const formId = props.navigation.getParam('formId');
  const status = props.navigation.getParam('status');
  const [position, setPosition] = React.useState(0);
  const [positionHistory, setPositionHistory] = React.useState<number[]>([]);
  const [responses, setResponses] = React.useState<IQuestionResponse[]>([]);
  const flatListRef = React.useRef<typeof FlatList>();
  const isPositionAtSummary = position === props.elementsCount;
  const listElements = isPositionAtSummary ? formatSummary(props.elements, responses) : formatElement(props.elements[position]);
  const isMandatoryAnswerMissing = getIsMandatoryAnswerMissing(listElements, responses);

  // LOADER =======================================================================================

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchDistribution = async () => {
    try {
      const content = await props.fetchFormContent(formId);
      if (content) {
        const res = await props.fetchDistributionResponses(distributionId);
        setResponses(res);
        if (content?.elementsCount && status === DistributionStatus.FINISHED) {
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

  // EVENTS =======================================================================================

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
    if (index) {
      setPositionHistory(positionHistory.splice(0, index));
    }
    setPosition(pos);
  };

  const postResponsesChanges = () => {
    const questions = listElements.filter(e => !getIsElementSection(e)) as IQuestion[];
    const session = getUserSession();

    for (const question of questions) {
      const res = responses.filter(r => r.questionId === question.id);
      // Delete responses of multiple answer questions
      if (question.type === QuestionType.MULTIPLEANSWER) {
        formService.distribution.deleteQuestionResponses(session, distributionId, question.id);
        res.map(r => (r.id = undefined));
      }
      res.map(response => {
        if (response.id) {
          formService.response.put(
            session,
            response.id,
            distributionId,
            response.questionId,
            response.choiceId ?? null,
            response.answer,
          );
        } else {
          formService.question
            .createResponse(session, response.questionId, distributionId, response.choiceId ?? null, response.answer)
            .then(r => (response.id = r.id));
        }
        return response;
      });
      // Add empty response to unanswered question
      if (!res.length) {
        formService.question
          .createResponse(session, question.id, distributionId, null, '')
          .then(r => updateResponses(question.id, [r]));
      }
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

  const submitDistribution = () => {
    Alert.alert(
      I18n.t('form.formDistributionScreen.submitAlert.title'),
      I18n.t(editable ? 'form.formDistributionScreen.submitAlert.editable.text' : 'form.formDistributionScreen.submitAlert.text'),
      [
        {
          text: I18n.t('common.cancel'),
          style: 'cancel',
        },
        {
          text: I18n.t('common.confirm'),
          onPress: async () => {
            try {
              const session = getUserSession();
              const distribution = await formService.distribution.get(session, distributionId);
              distribution.status = DistributionStatus.FINISHED;
              await formService.distribution.put(session, distribution);
              props.navigation.dispatch(NavigationActions.back());
            } catch (e) {
              Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
            }
          },
          style: 'default',
        },
      ],
    );
  };

  // HEADER =======================================================================================

  const navBarInfo = {
    title: props.navigation.getParam('title'),
    right:
      loadingRef.current === AsyncPagedLoadingState.DONE && !isPositionAtSummary ? (
        <TouchableOpacity onPress={() => postResponsesChanges()} style={styles.saveActionContainer}>
          <Picture type="NamedSvg" name="ui-save" fill={theme.ui.text.inverse} width={24} height={24} />
        </TouchableOpacity>
      ) : undefined,
  };

  // ERROR ========================================================================================

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  // ELEMENT ======================================================================================

  const renderSummaryHeading = () => {
    return isPositionAtSummary ? <HeadingSText style={styles.summaryText}>{I18n.t('form.summary')}</HeadingSText> : null;
  };

  const renderElement = (item: IFormElement) => {
    if (getIsElementSection(item)) {
      const { title, description } = item as ISection;
      return <FormSectionCard title={title} description={description} />;
    }
    const questionResponses = responses.filter(response => response.questionId === item.id);
    item = item as IQuestion;
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

  // POSITION ACTIONS =============================================================================

  const renderPositionActions = () => {
    return isPositionAtSummary ? (
      <ActionButton
        text={I18n.t('form.finishAndSend')}
        action={() => submitDistribution()}
        disabled={status === DistributionStatus.FINISHED && !editable}
      />
    ) : (
      <View style={styles.actionsContainer}>
        <ActionButton
          text={I18n.t('back')}
          type="secondary"
          action={() => goToPreviousPosition()}
          disabled={!positionHistory.length}
        />
        <ActionButton text={I18n.t('next')} action={() => goToNextPosition()} disabled={isMandatoryAnswerMissing} />
      </View>
    );
  };

  // DISTRIBUTION =================================================================================

  const renderDistribution = () => {
    return (
      <FlatList
        ref={ref => {
          flatListRef.current = ref;
        }}
        data={listElements}
        keyExtractor={element => (getIsElementSection(element) ? 's' : 'q') + element.id.toString()}
        renderItem={({ item }) => renderElement(item)}
        ListHeaderComponent={renderSummaryHeading()}
        ListFooterComponent={renderPositionActions()}
        ListFooterComponentStyle={styles.listFooterContainer}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  // RENDER =======================================================================================

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

  return (
    <PageView navigation={props.navigation} navBarWithBack={navBarInfo}>
      {renderPage()}
    </PageView>
  );
};

// MAPPING ========================================================================================

export default connect(
  (gs: IGlobalState) => {
    const state = moduleConfig.getState(gs);
    return {
      elements: state.formContent.data.elements,
      elementsCount: state.formContent.data.elementsCount,
      initialLoadingState: AsyncPagedLoadingState.PRISTINE,
      session: getUserSession(),
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
