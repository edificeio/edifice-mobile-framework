// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IAuthState {
  username?: string;
  userId?: string;
  loggedIn: boolean;
  synced: boolean;
  error?: string;
  notificationPrefs?: any;
}

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IAuthState = {
  loggedIn: false,
  synced: false
};

export const homeworkDiaryListReducer = (
  state: IAuthState = stateDefault,
  action
) => {
  switch (action.type) {
    // INSERT CASES HERE
    default:
      return state;
  }
};
