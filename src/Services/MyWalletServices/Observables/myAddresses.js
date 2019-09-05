
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import BlockchainServices from '../../BlockchainServices';

export default (myWalletService) =>{

    return Observable.create(function(observer) {

        var _data = null;
    
        var listAddresses = () =>{
    
            window.walletApi.listAddresses().then(data =>{
      
                if (_data == null || JSON.stringify(_data) != JSON.stringify(data))
                {
                    _data = data;
                    observer.next(data.map(row => Object.assign({},row,{
                        data: BlockchainServices.getAddress(row.address),
                        balance: BlockchainServices.getAddress(row.address).pipe(map(address => address.balance))
                    })));
                }
            })
            .catch(err => observer.error(err));
        };
    
        var myAddressAddedSubscription = myWalletService.myAddressAdded.subscribe(listAddresses);
        var myAddressUpdatedSubscription = myWalletService.myAddressUpdated.subscribe(listAddresses);
        
        var myAddressDeletedSubscription = myWalletService.myAddressDeleted.subscribe(listAddresses);
    
        var intervalId = setInterval(listAddresses, 30000);
        listAddresses();
    
        return () => {
            clearInterval(intervalId);
            myAddressAddedSubscription.unsubscribe();
            myAddressUpdatedSubscription.unsubscribe();
            myAddressDeletedSubscription.unsubscribe();
        }
      
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }));
}


