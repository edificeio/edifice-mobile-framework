import { HTTPError } from './error';
import { fetch, fetchJson } from './fetch';
import { fetchForAccount, fetchForSession, fetchJsonForAccount, fetchJsonForSession } from './fetch-for-account';
import { fetchForPlatform, fetchJsonForPlatform } from './fetch-for-platform';
import { imagePropsForAccount, imagePropsForSession } from './source';

/**
 * Utility functions for making HTTP requests.
 *
 * @module http
 * @exports fetch - Function to perform a generic fetch request.
 * @exports fetchJson - Function to perform a fetch request and parse the response as JSON.
 * @exports fetchForAccount - Function to perform a fetch request for a specific account.
 * @exports fetchJsonForAccount - Function to perform a fetch request for a specific account and parse the response as JSON.
 * @exports fetchForSession - Function to perform a fetch request for the active account.
 * @exports fetchJsonForSession - Function to perform a fetch request for the active account and parse the response as JSON.
 * @exports fetchForPlatform - Function to perform a fetch request for a specific platform.
 * @exports fetchJsonForPlatform - Function to perform a fetch request for a specific platform and parse the response as JSON.
 * @exports imagePropsForAccount - Function to call with image prop to format source for the given account
 * @exports imagePropsForSession - Function to call with image prop to format source for the active account
 */
export default {
  // api,
  fetch,
  fetchForAccount,
  fetchForPlatform,
  fetchForSession,
  fetchJson,
  fetchJsonForAccount,
  fetchJsonForPlatform,
  fetchJsonForSession,
  imagePropsForAccount,
  imagePropsForSession,
  // sessionApi,
};

export * from './v2';

export { HTTPError };
