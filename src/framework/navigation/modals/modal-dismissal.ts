import * as React from 'react';

/**
 * Closes open component modals before a redirection to avoid desynchronizing the
 * navigation state, see main-navigation.
 * only open modals subscribe, so the listeners indicate whether a modal needs closing.
 */
const closeListeners = new Set<() => void>();

export function useRegisterModalClose(isOpen: boolean, close: () => void) {
  React.useEffect(() => {
    if (!isOpen) return;
    closeListeners.add(close);
    return () => {
      closeListeners.delete(close);
    };
  }, [close, isOpen]);
}

export function closeOpenModals() {
  const hadOpenModal = closeListeners.size > 0;
  closeListeners.forEach(close => close());
  return hadOpenModal;
}
