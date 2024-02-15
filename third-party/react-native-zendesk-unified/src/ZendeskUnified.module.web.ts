const NON_SUPPORTED_MESSAGE = 'Zendesk is not supported on web yet';

/**
 * For now, we just warn that the module is not supported on web.
 */
export default {
  initialize() {
    console.warn(NON_SUPPORTED_MESSAGE);
  },
};
