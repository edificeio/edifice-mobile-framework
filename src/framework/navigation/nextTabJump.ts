/**
 * Export a ref to store the delayed navigation action on prevent Back;
 * Must be dispatched and cleared when it's consumed in preventBack handler
 */
import { CommonActions } from '@react-navigation/native';

let nextTabJump: CommonActions.Action | undefined;

export const consumeNextTabJump = () => {
  const ret = nextTabJump;
  nextTabJump = undefined;
  return ret;
};

export const setNextTabJump = (action: CommonActions.Action) => {
  nextTabJump = action;
};
