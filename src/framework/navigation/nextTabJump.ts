/**
 * Export a ref to store the delayed navigation action on prevent Back;
 * Must be dispatched and cleared when it's consumed in preventBack handler
 */
import { CommonActions, NavigationAction, StackActionType } from '@react-navigation/native';

type AllowedAction = CommonActions.Action | StackActionType | NavigationAction;
let nextTabJump: AllowedAction | AllowedAction[] | undefined;
let delayed: boolean = false;

export const consumeNextTabJump: () => [AllowedAction[], boolean] = () => {
  const ret = nextTabJump;
  const retDelayed = delayed;
  nextTabJump = undefined;
  delayed = false;
  if (!ret) return [[], retDelayed]; // return undefined
  if (!Array.isArray(ret)) return [[ret], retDelayed]; // return single action in array
  return [ret, retDelayed]; // return array as-is
};

export const setNextTabJump = (action: AllowedAction | AllowedAction[], d?: boolean) => {
  nextTabJump = action;
  delayed = d ?? false;
};
