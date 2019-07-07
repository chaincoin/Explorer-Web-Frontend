import { Observable, Subject, combineLatest,  } from 'rxjs';
import { shareReplay, switchMap, map } from 'rxjs/operators';

import bigDecimal from 'js-big-decimal';
import BlockchainServices from './BlockchainServices'



const myMasternodeAdded = new Subject();
const myMasternodeDeleted = new Subject();

const myAddressAdded = new Subject();
const myAddressDeleted = new Subject();

const inputLockStateAdded = new Subject();
const inputLockStateUpdated = new Subject();
const inputLockStateDeleted = new Subject();




const myAddresses = Observable.create(function(observer) {

    var _data = null;

    var listAddresses = () =>{

        window.walletApi.listAddresses().then(data =>{
  
            if (_data == null || _data.length != data.length)
            {
                _data = data;
                observer.next(data)
            }
        })
        .catch(err => observer.error(err));
    };

    var myAddressAddedSubscription = myAddressAdded.subscribe(listAddresses);
    var myAddressDeletedSubscription = myAddressDeleted.subscribe(listAddresses);

    var intervalId = setInterval(listAddresses, 30000);
    listAddresses();

    return () => {
        clearInterval(intervalId);
        myAddressAddedSubscription.unsubscribe();
        myAddressDeletedSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var addMyAddress = (name, address, WIF) =>{ 

    return window.walletApi.createAddress({
        name:name,
        address: address,
        WIF:WIF
    }).then(() => {
        broadcastEvent("myAddressAdded");
        myAddressAdded.next();
    });
  }

  var deleteMyAddress = (address) =>{ 
    return window.walletApi.deleteAddress({
        address: address
    }).then(() => {
        broadcastEvent("myAddressDeleted");
        myAddressDeleted.next();
    });
  }


  


const myMasternodes = Observable.create(function(observer) {

    var _data = null;

    var listMasternodes = () =>{
        window.walletApi.listMasternodes()
        .then(data =>{

            if (_data == null || _data.length != data.length)
            {
                _data = data;
                observer.next(data)
            }
        })
        .catch(err => observer.error(err));
    };

    var myMasternodeAddedSubscription = myMasternodeAdded.subscribe(listMasternodes);
    var myMasternodeDeletedSubscription = myMasternodeDeleted.subscribe(listMasternodes);

    var intervalId = setInterval(listMasternodes, 30000);
    listMasternodes();

    return () => {
        clearInterval(intervalId);
        myMasternodeAddedSubscription.unsubscribe();
        myMasternodeDeletedSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var addMyMasternode = (name, output) =>{ 
    return window.walletApi.createMasternode({
        name:name,
        output: output
    }).then(() => {
        broadcastEvent("myMasternodeAdded");
        myMasternodeAdded.next();
    });
  }

  var deleteMyMasternode = (output) =>{ 
    return window.walletApi.deleteMasternode({
        output: output
    }).then(() =>{
        broadcastEvent("myMasternodeDeleted")
        myMasternodeDeleted.next();
    });
  }


  const inputLockStates = Observable.create(function(observer) {

    var listInputLockStates = () =>{
        window.walletApi.listInputLockStates()
        .then(data =>{
            observer.next(data)
        })
        .catch(err => observer.error(err));
    };

    var inputLockStateAddedSubscription = inputLockStateAdded.subscribe(listInputLockStates);
    var inputLockStateUpdatedSubscription = inputLockStateUpdated.subscribe(listInputLockStates);
    var inputLockStateDeletedSubscription = inputLockStateDeleted.subscribe(listInputLockStates);

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
  }));


  var addInputLockState = (output, lockState) =>{ 
    return window.walletApi.createInputLockState({
        output: output,
        lockState: lockState
    }).then(() =>{
        broadcastEvent("inputLockStateAdded")
        inputLockStateAdded.next();
    });
  }

  var updateInputLockState = (output, lockState) =>{ 
    return window.walletApi.updateInputLockState({
        output: output,
        lockState: lockState
    }).then(() => {
        broadcastEvent("inputLockStateUpdated");
        inputLockStateUpdated.next();
    });
  }

  var deleteInputLockState = (output) =>{ 
    return window.walletApi.deleteInputLockState({
        output: output
    }).then(() => {
        broadcastEvent("inputLockStateDeleted");
        inputLockStateDeleted.next();
    });
  }


  var inputAddresses = myAddresses
  .pipe(
  switchMap(myAddresses => combineLatest(
    myAddresses.filter(myAddress => myAddress.WIF != null).map(myAddress => 
      combineLatest(
        BlockchainServices.getAddress(myAddress.address),
        BlockchainServices.getAddressUnspent(myAddress.address),
        inputLockStates, 
        BlockchainServices.blockCount, 
        BlockchainServices.memPool, 
        BlockchainServices.masternodeList
      )
      .pipe(
        map(([address,unspent, inputLockStates,blockCount, memPool, masternodeList]) =>{
            return {
                myAddress,
                address: address,
                inputs: unspent.map(unspent => {
                    var value = new bigDecimal(unspent.value);

                    var confirmations = (blockCount - unspent.blockHeight) + 1;

                    var isMatureCoins = unspent.payout == null ? true : confirmations > 102;
                    var inMemPool = memPool.find(r => r.vin.find(v => v.txid == unspent.txid && v.vout == unspent.vout )) != null;
                    var inMnList = Object.keys(masternodeList).find(output => output == unspent.txid + "-" + unspent.vout)  != null;
                    var lockState = inputLockStates[unspent.txid + "-" + unspent.vout];
                    return {
                        myAddress,
                        unspent: unspent,
                        value: value,
                        satoshi: parseFloat(value.multiply(new bigDecimal("100000000")).getValue()),
                        confirmations: confirmations,
                        lockState: lockState,
                        disabled: lockState != null ? lockState : inMemPool || inMnList || isMatureCoins == false,
                        isMatureCoins: isMatureCoins,
                        inMemPool: inMemPool,
                        inMnList: inMnList
                    }
                }).concat()
            }
        })
      )
    )
  )),
  shareReplay({
    bufferSize: 1,
    refCount: true
  })
);


export default {
    myAddresses,
    addMyAddress,
    deleteMyAddress,

    myMasternodes,
    addMyMasternode,
    deleteMyMasternode,


    inputLockStates,
    addInputLockState,
    updateInputLockState,
    deleteInputLockState,

    inputAddresses

}



var broadcastEvent = (event) =>{

    var version = window.localStorage.getItem(event);

    if (version == null) window.localStorage.setItem(event,0);
    else window.localStorage.setItem(event,version + 1);
}



window.addEventListener('storage', function(e) {

    if(e.key == "myMasternodeAdded") myMasternodeAdded.next();
    else if(e.key == "myMasternodeDeleted") myMasternodeDeleted.next();
    else if(e.key == "myAddressAdded") myAddressAdded.next()
    else if(e.key == "myAddressDeleted") myAddressDeleted.next()
    else if(e.key == "inputLockStateAdded") inputLockStateAdded.next()
    else if(e.key == "inputLockStateUpdated") inputLockStateUpdated.next()
    else if(e.key == "inputLockStateDeleted") inputLockStateDeleted.next()
});