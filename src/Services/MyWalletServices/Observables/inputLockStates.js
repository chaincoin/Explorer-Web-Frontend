
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export default (myWalletService) =>{

    return Observable.create(function(observer) {

        var listInputLockStates = () =>{
            window.walletApi.listInputLockStates()
            .then(data =>{
                observer.next(data)
            })
            .catch(err => observer.error(err));
        };
    
        var inputLockStateAddedSubscription = myWalletService.inputLockStateAdded.subscribe(listInputLockStates);
        var inputLockStateUpdatedSubscription = myWalletService.nputLockStateUpdated.subscribe(listInputLockStates);
        var inputLockStateDeletedSubscription = myWalletService.inputLockStateDeleted.subscribe(listInputLockStates);
    
        var intervalId = setInterval(listInputLockStates, 30000);
        listInputLockStates();
    
        return () => {
            clearInterval(intervalId);
            inputLockStateAddedSubscription.unsubscribe();
            inputLockStateUpdatedSubscription.unsubscribe();
            inputLockStateDeletedSubscription.unsubscribe();
        }
      
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }))
}


