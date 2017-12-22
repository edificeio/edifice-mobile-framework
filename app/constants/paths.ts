export const PATH_CONVERSATION = 'conversation/list/inbox?page=$1'

export const PATH_DOCUMENT = 'workspace/documents'

export const PATH_SIGNUP = 'auth/signup'
export const PATH_LOGIN = 'auth/login'
export const PATH_LOGOUT = 'auth/logout'
export const PATH_RECOVER_PASSWORD = 'auth/pass'

export const NAVIGATE = 'navigate'
export const INIT_NAVIGATION = 'init_navigate'
export const NAVIGATION_NAVIGATE = 'Navigation/NAVIGATE'

export const PATH_ERROR_RESET = '/RESET'



export function match( path1, path2) {
  if (path2 === undefined) return false;

  const tokens1 = path1.split('/')
  const tokens2 = path2.split('/')

  if (tokens1.length !== tokens2.length) return false

  for (let i = 0; i < tokens1.length; i++) {
    const token1 = tokens1[i]
    const token2 = tokens2[i]

    if (token1 === token2) continue

    if (token1[0] === '$') continue

    return false
  }
  return true
}

/**
 * Say if the two path path1 and path2 match
 * A path can be specified with pattern matching.
 * To specify a pattern use the syntax $n where n is between 1 and ~
 * For example: match( '/meetings/$1/$2', '/meetings/3/accept') return true
 *
 * @param {string[]} paths  a array of paths
 * @param {string} path2
 */
export function matchs(paths, path2) {
  return paths.reduce((acc, path) => match(path, path2) || acc, false)
}

/**
 * Replace $1 with the value
 *
 * @param {string} path1
 * @param {string} value
 */
export function replace1(path1, value) {
  return path1.replace('$1', value)
}

/**
 * Replace $1 and $2 with the value
 *
 * @param {string} path1
 * @param {string|number} value1
 * @param {string|number} value2
 */
export function replace2(path1, value1, value2) {
  return path1.replace('$1', value1).replace('$2', value2)
}
