/**
 * Navigation util
 */

import { NavigationState } from "react-navigation";

/**
 * Returns the given path relative to the given navigation state.
 * This function search for any common part between the nav state and the given path.
 * If any, the common part of the nav state and everything at its right is stripped and replaced by the given path.
 * @param navState current navigation state as given by `this.props.navigation.state`.
 * @param path path to go to.
 * @returns resulting path.
 */
export const computeRelativePath = (navState: NavigationState, path: string | string[]) => {
    if (!Array.isArray(path)) path = path.split('/');
    let stateAsArray = (navState?.routeName?.split('/') || []) as string[]; // TS fuck ? in practice, this property exists.

    // Check common part fo the path. Keep the left of the common part of NavState, then, add the path.
    const found = (() => {
        for (const i of path) {
            const index = stateAsArray.findIndex(item => item === i);
            if (index !== -1) return index;
        } return -1;
    })();
    if (found === -1) return path.join('/'); // No common part, return path as-is.
    return [...stateAsArray.slice(0, found), ...path].join('/'); // Return left uncommon part + given path.
}
