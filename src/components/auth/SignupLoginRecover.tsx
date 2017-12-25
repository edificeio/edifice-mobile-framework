import * as React from "react"
import {Login} from './Login'
import {RecoverPassword} from './RecoverPassword'
import { Row} from '..'
import {AuthProps} from '../../model/Auth'

export interface SignupLoginRecoverProps {
    auth?: AuthProps
    login?: (email: string, password:string) => void
    recoverPassword?: (email) => void
}

export interface SignupLoginRecoverState {
    route: string
}

export class SignupLoginRecover extends React.Component<SignupLoginRecoverProps, SignupLoginRecoverState> {
  state = {
      route: 'login'
  }


  onRoute(newRoute) {
    this.setState({ route: newRoute })
  }

  render() {
    const { email, password } = this.props.auth
    const { route } = this.state

    if (email.length > 0 && password.length > 0) {
      return <Row>{this.props.children}</Row>
    }

    return (
      <Row>
        {route === 'login' && <Login onRoute={r => this.onRoute(r)} {...this.props} />}
        {route === 'pass' && <RecoverPassword onRoute={r => this.onRoute(r)} {...this.props} />}
      </Row>
    )
  }
}


