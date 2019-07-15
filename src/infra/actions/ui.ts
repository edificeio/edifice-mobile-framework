export const setHeader = dispatch => (newHeight) => {
    dispatch({
        type: 'SET_HEADER_HEIGHT_UI',
        height: newHeight
    });
}