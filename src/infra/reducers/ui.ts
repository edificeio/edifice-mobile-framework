import { UI_SIZES } from '~/framework/components/constants';

// ToDo : remove this file in favor of react-navigation 6 navBar handling

const getStatusBarHeight = () => 20;

interface UiState {
  headerHeight: number;
}

const initialState = {
  headerHeight: UI_SIZES.elements.navbarHeight + getStatusBarHeight(),
};

export default (state: UiState = initialState, action): UiState => {
  if (action.type === 'SET_HEADER_HEIGHT_UI') {
    return {
      ...state,
      headerHeight: action.height + getStatusBarHeight(),
    };
  }

  return { ...state };
};
