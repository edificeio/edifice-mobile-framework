import * as React from 'react';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import ResourceExplorer, { ResourceExplorerTemplate } from '../../explorer/templates/resource-explorer';
import { createResourceExplorerNavBar } from '../../explorer/templates/resource-explorer/screen';
import moduleConfig from '../module-config';
import { HomeworkNavigationParams, homeworkRouteNames } from '../navigation';
import { selectors } from '../reducers';
import { getHomeworkWorkflowInformation } from '../rights';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { sessionScreen } from '~/framework/components/screen';
import homeworkDiarySelected from '~/framework/modules/homework/actions/selectedDiary';
import { HomeworkExplorerScreen } from '~/framework/modules/homework/components/HomeworkExplorerScreen';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Trackers } from '~/framework/util/tracker';

// # Props

export namespace HomeworkExplorerScreen {
  export interface NavParams extends ResourceExplorerTemplate.NavParams {}
  export type NavigationProps = NativeStackScreenProps<HomeworkNavigationParams, 'homeworkExplorer'>;
  export interface AllProps
    extends Omit<ResourceExplorerTemplate.ScreenProps, keyof ResourceExplorerTemplate.NavigationProps>,
      NavigationProps {}
}

// # NavBar

export const computeNavBar = createResourceExplorerNavBar('homework-explorer-homeworks', selectors.explorer);

const homeworkExplorerContext = {
  application: 'homeworks',
  resource_type: 'homeworks',
};

// # Screen

export default sessionScreen<HomeworkExplorerScreen.AllProps>(({ navigation, route, session, ...props }) => {
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, undefined, Action>>();

  // This is some hack used becasue this screen can be included within another (HomeworkInitialScreen).
  // In this case, the navbar of explorer screen is not used, so we must use setOptions to make sure title is correct.
  React.useEffect(() => {
    navigation.setOptions(computeNavBar({ navigation, route }));
  }, [navigation, route]);

  const onOpenResource = React.useCallback<NonNullable<ResourceExplorerTemplate.Props['onOpenResource']>>(
    r => {
      dispatch(homeworkDiarySelected(r.resourceEntId));
      navigation.navigate(homeworkRouteNames.homeworkTaskList, {});
    },
    [dispatch, navigation],
  );

  const emptyComponent = React.useMemo(() => {
    const homeworkWorkflowInformation = getHomeworkWorkflowInformation(session);
    const hasCreateHomeworkResourceRight = homeworkWorkflowInformation && homeworkWorkflowInformation.create;
    return (
      <EmptyScreen
        svgImage="empty-search"
        title={I18n.get('homework-explorer-emptyscreen-title')}
        text={I18n.get('homework-explorer-emptyscreen-text')}
        buttonText={hasCreateHomeworkResourceRight ? I18n.get('homework-explorer-creatediary') : undefined}
        buttonUrl="/homeworks"
        buttonAction={() => Trackers.trackEvent('Homework', 'GO TO', 'Create in Browser')}
      />
    );
  }, [session]);

  return (
    <ResourceExplorer
      {...props}
      navigation={navigation as ResourceExplorerTemplate.NavigationProps['navigation']}
      route={{ ...route, name: homeworkRouteNames.homeworkExplorer }}
      moduleConfig={moduleConfig}
      onOpenResource={onOpenResource}
      selectors={selectors.explorer}
      emptyComponent={emptyComponent}
      context={homeworkExplorerContext}
    />
  );
});
