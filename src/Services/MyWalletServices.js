import crypto from 'crypto';

import { Observable, Subject, BehaviorSubject, combineLatest, throwError, of, from, zip } from 'rxjs';
import { shareReplay, switchMap, map, first } from 'rxjs/operators';


import bigDecimal from 'js-big-decimal';
import BlockchainServices from './BlockchainServices'

const cryptoAlgorithm = 'aes-256-ctr'

const isWalletEncrypted = new BehaviorSubject(window.walletApi.isWalletEncrypted());


const myMasternodeAdded = new Subject();
const myMasternodeUpdated = new Subject();
const myMasternodeDeleted = new Subject();

const myAddressAdded = new Subject();
const myAddressUpdated = new Subject();
const myAddressDeleted = new Subject();

const inputLockStateAdded = new Subject();
const inputLockStateUpdated = new Subject();
const inputLockStateDeleted = new Subject();




const myAddresses = Observable.create(function(observer) {

    var _data = null;

    var listAddresses = () =>{

        window.walletApi.listAddresses().then(data =>{
  
            if (_data == null || JSON.stringify(_data) != JSON.stringify(data))
            {
                _data = data;
                observer.next(data)
            }
        })
        .catch(err => observer.error(err));
    };

    var myAddressAddedSubscription = myAddressAdded.subscribe(listAddresses);
    var myAddressUpdatedSubscription = myAddressUpdated.subscribe(listAddresses);
    
    var myAddressDeletedSubscription = myAddressDeleted.subscribe(listAddresses);

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

  const myAddress = (address) =>{
    return myAddresses.pipe(map(myAddresses => myAddresses.find(myMn => myMn.address == address)));  //TODO: this needs to be smarter now
  }


  var addMyAddress = (name, address, WIF, encryptedWIF) =>{ 

    return window.walletApi.createAddress({
        name:name,
        address: address,
        WIF:WIF,
        encryptedWIF: encryptedWIF
    }).then(() => {
        broadcastEvent("myAddressAdded");
        myAddressAdded.next();
    });
  }

  var updateMyAddress = (address) =>{ 

    return window.walletApi.updateAddress(address).then(() => {
        broadcastEvent("myAddressUpdated");
        myAddressUpdated.next();
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

            if (_data == null || JSON.stringify(_data) != JSON.stringify(data)) 
            {
                _data = data;
                observer.next(data)
            }
        })
        .catch(err => observer.error(err));
    };

    var myMasternodeAddedSubscription = myMasternodeAdded.subscribe(listMasternodes);
    var myMasternodeUpdatedSubscription = myMasternodeUpdated.subscribe(listMasternodes);
    var myMasternodeDeletedSubscription = myMasternodeDeleted.subscribe(listMasternodes);

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

  var myMasternode = (output) =>{
    return myMasternodes.pipe(map(myMns => myMns.find(myMn => myMn.output == output)));  //TODO: this needs to be smarter now
  }

  var addMyMasternode = (name, output, privateKey, encryptedPrivateKey) =>{ 
    return window.walletApi.createMasternode({
        name:name,
        output: output,
        privateKey: privateKey,
        encryptedPrivateKey: encryptedPrivateKey
    }).then(() => {
        broadcastEvent("myMasternodeAdded");
        myMasternodeAdded.next();
    });
  }

  var UpdateMyMasternode = (masternode) =>{ 
    return window.walletApi.updateMasternode(masternode).then(() => {
        broadcastEvent("myMasternodeUpdated");
        myMasternodeUpdated.next();
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
  switchMap(myAddresses => zip(...
    myAddresses.filter(myAddress => myAddress.WIF != null || myAddress.encryptedWIF != null).map(myAddress => 
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
                    var inMnList = masternodeList[unspent.txid + "-" + unspent.vout] != null;
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





const checkWalletPassword = (password) =>{
  var walletPasswordVerification = window.localStorage["walletPasswordVerification"];

  try{
    const decrypted = decrypt(password, walletPasswordVerification);
    const hash = window.bitcoin.crypto.sha256(Buffer.from(password, 'utf8'))

    return decrypted == hash.toString("hex");
  }
  catch(ex)
  {
    return false;
  }
}



const setWalletPassword = (newPassword) =>{

  return isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted ? throwError("Wallet password already set") : of(true)),
    switchMap(() => from(window.walletApi.encryptWallet((wif) => encrypt(newPassword, wif)))),
    switchMap(() =>{
      const hash = window.bitcoin.crypto.sha256(Buffer.from(newPassword, 'utf8'));
      const walletPasswordVerification = encrypt(newPassword, hash.toString("hex"));

      window.localStorage["walletPasswordVerification"] = walletPasswordVerification;

      isWalletEncrypted.next(true);
      broadcastEvent("walletEncrypted");

      myAddressUpdated.next();
      broadcastEvent("myAddressUpdated");

      return of(true);
    })
  );
  
}

const removeWalletPassword = (password) =>{

  return isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ? throwError("Wallet password not set") : of(true)),
    switchMap(() => checkWalletPassword(password) == false ? throwError("Wallet password incorrect") : of(true)),
    switchMap(() => from(window.walletApi.decryptWallet(encryptedWif => decrypt(password, encryptedWif)))),
    switchMap(walletEncrypted =>{

      window.localStorage["walletPasswordVerification"] = "";

      isWalletEncrypted.next(false);
      broadcastEvent("walletDecrypted");

      myAddressUpdated.next();
      broadcastEvent("myAddressUpdated");
      
      return of(true);
    })
  );
}

const changeWalletPassword = (oldPassword, newPassword) =>{

}




const myWalletData = combineLatest(myAddresses, myMasternodes, inputLockStates).pipe(
  map(([myAddresses,myMasternodes,inputLockStates]) => ({
    walletPasswordVerification: window.localStorage["walletPasswordVerification"], //TODO: shouldnt be accessing walletPasswordVerification data like this
    myAddresses, myMasternodes, inputLockStates
  }))
);


const importMyWalletData = (myWalletData) =>{

  return from(window.walletApi.importMyWalletdata(myWalletData)).pipe(
    switchMap(result =>{

      window.localStorage["walletPasswordVerification"] = myWalletData.walletPasswordVerification;

      myAddressDeleted.next(true);
      myAddressAdded.next(true);
      
      myMasternodeDeleted.next(true);
      myMasternodeAdded.next(true);

      inputLockStateAdded.next(true);
      inputLockStateDeleted.next(true);

      return result;
    })
  );
   
}

const clearMyWalletData = (password) =>{
  return isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ? of(true) : (checkWalletPassword(password) == false ? throwError("Wallet password incorrect") : of(true))),
    switchMap(() => from(window.walletApi.clearMyWalletdata())),
    switchMap(() =>{

      //TODO: this doesnt trigger event on other tabs
      window.localStorage["walletPasswordVerification"] = "";

      myAddressDeleted.next(true);
      myAddressAdded.next(true);
      
      myMasternodeDeleted.next(true);
      myMasternodeAdded.next(true);

      inputLockStateAdded.next(true);
      inputLockStateDeleted.next(true);

      isWalletEncrypted.next(false);
      
      return of(true);
    })
  );
}


const encrypt = (password, decrypted) =>{
  var cipher = crypto.createCipher(cryptoAlgorithm,password)
  var crypted = cipher.update(decrypted,'utf8','hex')
  crypted += cipher.final('hex');

  return crypted;
}

const decrypt = (password, encrypted) =>{
  var decipher = crypto.createDecipher(cryptoAlgorithm,password)
  var dec = decipher.update(encrypted,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


export default {
    myAddresses,
    myAddress,
    addMyAddress,
    updateMyAddress,
    deleteMyAddress,

    myMasternodes,
    myMasternode,
    addMyMasternode,
    UpdateMyMasternode,
    deleteMyMasternode,


    inputLockStates,
    addInputLockState,
    updateInputLockState,
    deleteInputLockState,

    inputAddresses,

    
    isWalletEncrypted,
    checkWalletPassword,
    setWalletPassword,
    changeWalletPassword,
    removeWalletPassword,
    encrypt,
    decrypt,
    myWalletData,
    importMyWalletData,
    clearMyWalletData

}



var broadcastEvent = (event) =>{

    var version = window.localStorage.getItem(event);

    if (version == null) window.localStorage.setItem(event,0);
    else window.localStorage.setItem(event,version + 1);
}



window.addEventListener('storage', function(e) {

    if(e.key == "myMasternodeAdded") myMasternodeAdded.next();
    else if(e.key == "myMasternodeUpdated") myMasternodeUpdated.next();
    else if(e.key == "myMasternodeDeleted") myMasternodeDeleted.next();
    else if(e.key == "myAddressAdded") myAddressAdded.next();
    else if(e.key == "myAddressUpdated") myAddressUpdated.next();
    else if(e.key == "myAddressDeleted") myAddressDeleted.next();
    else if(e.key == "inputLockStateAdded") inputLockStateAdded.next();
    else if(e.key == "inputLockStateUpdated") inputLockStateUpdated.next();
    else if(e.key == "inputLockStateDeleted") inputLockStateDeleted.next();
    else if(e.key == "walletEncrypted") isWalletEncrypted.next(true);
    else if(e.key == "walletDecrypted") isWalletEncrypted.next(false);
});