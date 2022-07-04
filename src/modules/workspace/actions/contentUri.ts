export const SET_CONTENT_URI_TYPE = 'CONTENT_URI_TYPE';

export function contentUriAction(contentUri) {
  return { type: SET_CONTENT_URI_TYPE, payload: contentUri };
}
