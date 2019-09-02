
import { ReplaySubject} from 'rxjs';
import Utils from '../../Utils';

export default (myWalletService) =>{

    var replaySubject = new ReplaySubject(1);

    var refreshIsWalletEncrypted = () =>{
        window.walletApi.isWalletEncrypted().then(isWalletEncrypted =>{
            if (replaySubject._events[0] != isWalletEncrypted)replaySubject.next(isWalletEncrypted);
        });
    }

    window.addEventListener('storage', function(e) {
        if(e.key == "refreshIsWalletEncryption") refreshIsWalletEncrypted();
    });


    replaySubject.subscribe((isWalletEncrypted) =>{
        Utils.broadcastEvent("refreshIsWalletEncryption");
    });

    refreshIsWalletEncrypted();

    return replaySubject;
}


