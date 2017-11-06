import { Conf } from '../../Conf';

class User {
    email: string;
    password: string;
    loggedIn: boolean;
    synced: boolean;
    userinfo;

    async sync(){
        const response = await fetch(`${Conf.platform}/auth/oauth2/userinfo`);
        console.log(response);
        this.synced = true;
        try{
            const data = await response.json();
            this.userinfo = data;
            this.loggedIn = true;
        }
        catch(e){
            this.loggedIn = false;
        }
    }

    async login(){
        const response = await fetch(`${Conf.platform}/auth/login`, {
          method: 'post',
          body: `email=${this.email}&password=${this.password}&rememberMe=true`,
          headers: {
              'Content-type': 'application/x-www-form-urlencoded'
          }
        });
        console.log(response);
    }
}

export const me = new User();