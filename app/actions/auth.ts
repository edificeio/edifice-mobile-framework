import { PATH_LOGIN, PATH_LOGOUT, PATH_RECOVER_PASSWORD, PATH_SIGNUP } from '../constants/paths'
import { create } from './docs'

/**
 *
 * @param {string} email     login du user
 * @param {string} password     password du user
 * @param {boolean} synced    say if we put yourglass
 * @returns {PATH_LOGIN}
 */
export const login = (email, password) => {
  return create(PATH_LOGIN, { email, password, rememberMe: true }, true) // create et non read pour recuperrer le password
}

/**
 * Logout du user
 *
 * @returns {{type}}
 */
export const logout = () => {
  return { path: PATH_LOGOUT, type: PATH_LOGOUT }
}

/**
 * Enregistrement d'un user
 *
 * @param {string} username   login du user
 * @param {string} password   password du user
 * @param {string} email      email du user
 * @returns {PATH_SIGNUP}
 */
export const signup = (username, password, email) => {
  return create(PATH_SIGNUP, { username, password, email })
}

/**
 * Recuperation du password du user
 *
 * @param {string } email     email du user
 * @returns {PATH_RECOVER_PASSWORD}
 */
export const recoverPassword = email => {
  return create(PATH_RECOVER_PASSWORD, { email })
}

/**
 * Same as login but without cursor
 * @param {string} username     login du user
 * @param {string} password     password du user
 * @param {boolean} synced    say if we put yourglass
 * @returns {PATH_LOGIN}
 */
export const checkLogin = (username, password) => {
  return create(PATH_LOGIN, { username, password }, false) // create et non read pour recuperrer le password
}
