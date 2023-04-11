import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack'
import I18n from 'i18n-js'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { IGlobalState } from '~/app/store'
import { PageView } from '~/framework/components/page'
import { BodyBoldText } from '~/framework/components/text'
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation'
import { navBarOptions } from '~/framework/navigation/navBar'

import styles from './styles'
import type { UserFamilyScreenDispatchProps, UserFamilyScreenPrivateProps } from './types'

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.family>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.mode === 'children' ? I18n.t('directory-childrenTitle') : I18n.t('directory-relativesTitle'),
  }),
})

function UserFamilyScreen(props: UserFamilyScreenPrivateProps) {
  return (
    <PageView>
      <BodyBoldText>user family screen</BodyBoldText>
    </PageView>
  )
}

export default connect(
  (state: IGlobalState) => {
    return {}
  },
  dispatch => bindActionCreators({}, dispatch),
)(UserFamilyScreen)
