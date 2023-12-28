/**
 * Notifier
 * Central way to display a custom message in a colored banner.
 *
 * Usage :
 *
 * import Notifier from '~/framework/util/notifier';
 * <Notifier id={NOTIFIER_ID} />
 *
 * ...
 *
 * import { notifierShowAction } from '~/framework/util/notifier/actions';
 * dispatch(notifierShowAction({
 *   type: 'info' | 'success' | 'warning' | 'error',
 *   id: NOTIFIER_ID;
 *   text?: string;
 *   icon?: string;
 *   loading?: boolean;
 *   persistent?: boolean;
 *   duration?: number;
 * }))
 */
import { Reducers } from '~/app/store';

import reducer from './reducer';

Reducers.register('notifiers', reducer);

export { default } from './component';
