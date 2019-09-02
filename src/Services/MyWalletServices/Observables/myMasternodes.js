
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export default (myWalletService) =>{

    return Observable.create(function(observer) {

        var _data = null;
    
        var listMasternodes = () =>{
            window.walletApi.listMasternodes()
            .then(data =>{
    
                if (_data == null || JSON.stringify(_data) != JSON.stringify(data)) 
                {
                    _data = data;
                    observer.next(data)
                }
            })
            .catch(err => observer.error(err));
        };
    
        var myMasternodeAddedSubscription = myWalletService.myMasternodeAdded.subscribe(listMasternodes);
        var myMasternodeUpdatedSubscription = myWalletService.myMasternodeUpdated.subscribe(listMasternodes);
        var myMasternodeDeletedSubscription = myWalletService.myMasternodeDeleted.subscribe(listMasternodes);
    
        var intervalId = setInterval(listMasternodes, 30000);
        listMasternodes();
    
        return () => {
            clearInterval(intervalId);
            myMasternodeAddedSubscription.unsubscribe();
            myMasternodeUpdatedSubscription.unsubscribe();
            myMasternodeDeletedSubscription.unsubscribe();
        }
      
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }));
}


