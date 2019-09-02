
import { Subject} from 'rxjs';
import Utils from '../../Utils';

export default (myWalletService, eventName) =>{

    var subject = new Subject(0);
    var tracker = {};
  


    window.addEventListener('storage', function(e) {
        if(e.key == eventName) {
            subject.next(tracker);
        }
    });


    subject.subscribe(tracker =>{
        if (tracker != tracker) Utils.broadcastEvent(eventName);
    });

    return subject;
}


