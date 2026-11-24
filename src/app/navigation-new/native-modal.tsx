/**
 * Native Modal
 *
 * The `Modal` of react-native, made to live with the navigation of the app. Use it instead of `Modal` for a modal that is not a
 * screen (a popover hanging on a view and its gesture, like the reaction picker of `audience`). A modal that is a step of the
 * navigation is a screen instead (`defineModal`).
 *
 * A `Modal` is out of the navigation: it shows over everything, the screens that come after its own included. `NativeModal` adds:
 * - closing when the screen that shows it loses the focus (navigation to another screen that leaves it mounted: `navigate`, tab,
 *   notification, deep link). It hides (with its `animationType`) and tells why (`onClose('blur')`) so that the state of the
 *   caller follows. When the screen is removed (`reset`, `replace`, `goBack`), the `Modal` is unmounted with it, and closes;
 * - the back button of Android, required (`onClose('back')`): `onRequestClose` of `Modal`, which Android needs.
 */
import React from 'react';
import { Modal, type ModalProps } from 'react-native';

import { useIsFocused } from './hooks';

/** Why the modal asks to close: the back button of Android, or its screen lost the focus (then the modal is already hiding). */
export type NativeModalCloseReason = 'back' | 'blur';

export interface NativeModalProps extends Omit<ModalProps, 'onRequestClose'> {
  /** The modal asks to close: the caller sets `visible` to `false`, at once for `blur`, after its own animations for `back` if any. */
  onClose: (reason: NativeModalCloseReason) => void;
}

export function NativeModal({ onClose, visible = true, ...modalProps }: Readonly<NativeModalProps>) {
  const isFocused = useIsFocused();
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (visible && !isFocused) onCloseRef.current('blur');
  }, [isFocused, visible]);

  const onRequestClose = React.useCallback(() => onCloseRef.current('back'), []);

  return <Modal {...modalProps} visible={visible && isFocused} onRequestClose={onRequestClose} />;
}
