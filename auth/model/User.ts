import { Conf } from '../../Conf';
import { Image } from 'react-native';

class User {
    email: string;
    password: string;
    loggedIn: boolean;
    synced: boolean;
    userinfo = {} as any;

    async sync(){
        const response = await fetch(`${Conf.platform}/auth/oauth2/userinfo`);
        console.log(response);
        this.synced = true;
        try{
            const data = await response.json();
            this.userinfo = data;
            const res = await Image.prefetch('https://preprod-paris.opendigitaleducation.com/workspace/document/22f5b939-0d53-4e76-99fc-891b3d6abf34?thumbnail=381x381&');
            console.log(res);
            console.log(this.userinfo);
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
          } as any
        });
        console.log(response);
        if(response.url.indexOf('/auth/login') === -1){
            this.loggedIn = true;
        }
    }
}

export const me = new User();