/**
 * Export a ref to store the delayed navigation action on prevent Back;
 * Must be dispatched and cleared when it's consumed in preventBack handler
 */

import { NavigationAction } from '@react-navigation/native';

import { StackNavigationAction } from '.';

export const NAVIGATE_CLOSE_DELAY = 333;

type AllowedAction = StackNavigationAction | NavigationAction;

const nextActionsMap: {
  confirmQuit?: AllowedAction | AllowedAction[];
  modalClose?: AllowedAction | AllowedAction[];
} = {};
let delayNextActions: boolean = false;

function consumeNextActions(register: keyof typeof nextActionsMap): [AllowedAction[], boolean] {
  const ret = nextActionsMap[register];
  const retDelayed = delayNextActions;
  nextActionsMap[register] = undefined;
  delayNextActions = false;
  if (!ret) return [[], retDelayed]; // return undefined
  if (!Array.isArray(ret)) return [[ret], retDelayed]; // return single action in array
  return [ret, retDelayed]; // return array as-is
}

export const consumeConfirmQuitAction: () => [AllowedAction[], boolean] = () => {
  return consumeNextActions('confirmQuit');
};

export const consumeModalCloseAction: () => [AllowedAction[], boolean] = () => {
  return consumeNextActions('modalClose');
};

export const setConfirmQuitAction = (action: AllowedAction | AllowedAction[], d?: boolean) => {
  nextActionsMap.confirmQuit = action;
  delayNextActions = d ?? false;
};

export const setModalCloseAction = (action: AllowedAction | AllowedAction[], d?: boolean) => {
  nextActionsMap.modalClose = action;
  delayNextActions = d ?? false;
};
