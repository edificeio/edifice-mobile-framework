
import { Image } from 'react-native';
import { Conf } from '../../Conf';

class User {
    synced: boolean;
    userinfo = {} as any;

    async sync(){
        const response = await fetch(`${Conf.platform}/auth/oauth2/userinfo`);
        console.log(response);
        this.synced = true;
        try{
            const data = await response.json();
            this.userinfo = data;
            console.log(this.userinfo);
        }
        catch(e){
        }
    }
}

export const me = new User();