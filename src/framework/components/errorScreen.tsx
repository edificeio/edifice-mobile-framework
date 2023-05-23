import * as React from 'react';

import { I18n } from '~/app/i18n';

import { EmptyScreen } from './emptyScreen';

// TODO: refine this component by adding additional cases & screens

export enum ErrorType {
  SERVER_UNREACHABLE = 'server_unreachable', // the server is unreachable (no connection or no server response)
  HTTP_ERROR = 'http_error', // the server returns an error (for example, the ressource has been deleted or the user doesn't have an access right)
  DATA_ERROR = 'data_error', // the data is incorrect or incomplet (for example, a missing ID that would allow to make an API call)
  RUNTIME_ERROR = 'runtime_error', // the data can't be processed (for example, inside the html parser)
}

export const errorScreens = {
  server_unreachable: () => (
    <EmptyScreen
      svgImage="empty-light"
      title={I18n.get('common.error.connection.title')}
      text={I18n.get('common.error.connection.text')}
    />
  ),
  http_error: () => (
    <EmptyScreen
      svgImage="empty-content"
      title={I18n.get('common.error.content.title')}
      text={I18n.get('common.error.content.text')}
    />
  ),
  data_error: () => (
    <EmptyScreen
      svgImage="empty-content"
      title={I18n.get('common.error.content.title')}
      text={I18n.get('common.error.content.text')}
    />
  ),
  runtime_error: () => (
    <EmptyScreen
      svgImage="empty-light"
      title={I18n.get('common.error.connection.title')}
      text={I18n.get('common.error.connection.text')}
    />
  ),
};
