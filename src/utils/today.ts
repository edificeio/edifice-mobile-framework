/**
 * Gives more control on today simulation.
 * Used for debug purpose. In production, replace it by a simple moment() call.
 * TODO : how to do that ?
 */
import moment from 'moment';

export default function () {
  return moment();
}
