import * as React from 'react';

import moduleConfig from '~/framework/modules/workspace/module-config';
import { Filter } from '~/framework/modules/workspace/reducer';
import WorkspaceFileListScreen, { computeNavBar as WorkspaceFileListNavBar } from '~/framework/modules/workspace/screens/file-list';
import WorkspaceFilePreviewScreen, {
  computeNavBar as WorkspaceFilePreviewNavBar,
} from '~/framework/modules/workspace/screens/file-preview';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { WorkspaceNavigationParams, workspaceRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<WorkspaceNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={workspaceRouteNames.home}
        component={WorkspaceFileListScreen}
        options={WorkspaceFileListNavBar}
        initialParams={{ filter: Filter.ROOT, parentId: 'root' }}
      />
      <Stack.Screen
        name={workspaceRouteNames.filePreview}
        component={WorkspaceFilePreviewScreen}
        options={WorkspaceFilePreviewNavBar}
        initialParams={{}}
      />
    </>
  ));
