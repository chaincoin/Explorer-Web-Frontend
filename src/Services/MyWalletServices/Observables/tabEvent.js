
import { Subject} from 'rxjs';
import Utils from '../../Utils';

export default (myWalletService, eventName) =>{

    var subject = new Subject(0);
    var _tracker = {};
  


    window.addEventListener('storage', function(e) {
        if(e.key == eventName) {
            subject.next(_tracker);
        }
    });


    subject.subscribe(tracker =>{
        if (tracker != _tracker) Utils.broadcastEvent(eventName);
    });

    return subject;
}


