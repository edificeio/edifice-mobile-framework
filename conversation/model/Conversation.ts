import { Mail } from './Mail';
import { Conf } from '../../Conf';
import { Mix } from 'entcore-toolkit';
import { Thread } from './Thread';

class Inbox{
    threads: Thread[];
    page: number;
    lastPage: boolean;

    async sync(){
        console.log('syncing')
        if(!this.threads){
            this.threads = [];
        }
        const response = await fetch(`${ Conf.platform }/conversation/list/inbox?page=${this.page}`);
        const data = await response.json();
        this.page ++;
        if(data.length === 0){
            this.lastPage = true;
        }
        this.threads = this.threads.concat(this.threads, Mix.castArrayAs(Thread, data.filter(thread => !thread.parent_id)));
        for(let i = 0; i < data.length; i++){
            if(data[i].parent_id){
                let thread = this.threads.find(t => t.id === data[i].parent_id);
                if(thread){
                    thread.addMail(data[i]);
                }
            }
            else{
                let thread = this.threads.find(t => t.id === data[i].id);
                thread.addMail(data[i]);
            }
        }
        if(this.threads.length < 40){
            await this.sync();
        }
    }
}

export class Conversation{
    static inbox = new Inbox();
}