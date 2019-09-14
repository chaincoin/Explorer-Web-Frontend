import crypto from 'crypto';

import { Observable, Subject, BehaviorSubject, combineLatest, throwError, of, from, zip } from 'rxjs';
import { shareReplay, switchMap, map, first } from 'rxjs/operators';


import isWalletEncrypted from './Observables/isWalletEncrypted';
import tabEvent from './Observables/tabEvent';

import myAddresses from './Observables/myAddresses';
import myAddress from './Observables/myAddress';

import myMasternodes from './Observables/myMasternodes';
import myMasternode from './Observables/myMasternode';

import inputLockStates from './Observables/inputLockStates';

import inputAddresses from './Observables/inputAddresses';

const cryptoAlgorithm = 'aes-256-ctr'



var myWalletService = {};

myWalletService.myMasternodeAdded = tabEvent(myWalletService,"myMasternodeAdded");
myWalletService.myMasternodeUpdated = tabEvent(myWalletService,"myMasternodeUpdated");
myWalletService.myMasternodeDeleted = tabEvent(myWalletService,"myMasternodeDeleted");

myWalletService.myAddressAdded = tabEvent(myWalletService,"myAddressAdded");
myWalletService.myAddressUpdated = tabEvent(myWalletService,"myAddressUpdated");
myWalletService.myAddressDeleted = tabEvent(myWalletService,"myAddressDeleted");

myWalletService.inputLockStateAdded = tabEvent(myWalletService,"inputLockStateAdded");
myWalletService.inputLockStateUpdated = tabEvent(myWalletService,"inputLockStateUpdated");
myWalletService.inputLockStateDeleted = tabEvent(myWalletService,"inputLockStateDeleted");




myWalletService.isWalletEncrypted = isWalletEncrypted(myWalletService);

myWalletService.myAddresses = myAddresses(myWalletService);
myWalletService.myAddress = myAddress(myWalletService);

myWalletService.myMasternodes = myMasternodes(myWalletService);
myWalletService.myMasternode = myMasternode(myWalletService);

myWalletService.inputLockStates = inputLockStates(myWalletService);
myWalletService.inputAddresses = inputAddresses(myWalletService);


myWalletService.addMyAddress = (name, address, WIF, encryptedWIF) =>{ 

    return window.walletApi.createAddress({
        name:name,
        address: address,
        WIF:WIF,
        encryptedWIF: encryptedWIF
    }).then(() => {
        myWalletService.myAddressAdded.next();
    });
  }

  myWalletService.updateMyAddress = (address) =>{ 
    return window.walletApi.updateAddress(address).then(() => {
        myWalletService.myAddressUpdated.next();
    });
  }

  myWalletService.deleteMyAddress = (address) =>{ 
    return window.walletApi.deleteAddress({
        address: address
    }).then(() => {
        myWalletService.myAddressDeleted.next();
    });
  }


  


  myWalletService.addMyMasternode = (name, output, privateKey, encryptedPrivateKey) =>{ 
    return window.walletApi.createMasternode({
        name:name,
        output: output,
        privateKey: privateKey,
        encryptedPrivateKey: encryptedPrivateKey
    }).then(() => {
        myWalletService.myMasternodeAdded.next();
    });
  }

  myWalletService.UpdateMyMasternode = (masternode) =>{ 
    return window.walletApi.updateMasternode(masternode).then(() => {
        myWalletService.myMasternodeUpdated.next();
    });
  }

  myWalletService.deleteMyMasternode = (output) =>{ 
    return window.walletApi.deleteMasternode({
        output: output
    }).then(() =>{
        myWalletService.myMasternodeDeleted.next();
    });
  }



  myWalletService.addInputLockState = (output, lockState) =>{ 
    return window.walletApi.createInputLockState({
        output: output,
        lockState: lockState
    }).then(() =>{
        myWalletService.inputLockStateAdded.next();
    });
  }

  myWalletService.updateInputLockState = (output, lockState) =>{ 
    return window.walletApi.updateInputLockState({
        output: output,
        lockState: lockState
    }).then(() => {
        myWalletService.inputLockStateUpdated.next();
    });
  }

  myWalletService.deleteInputLockState = (output) =>{ 
    return window.walletApi.deleteInputLockState({
        output: output
    }).then(() => {
        myWalletService.inputLockStateDeleted.next();
    });
  }





myWalletService.checkWalletPassword = (password) =>{

  

  return window.walletApi.getWalletPasswordVerification().then(walletPasswordVerification => {

    const decrypted = myWalletService.decrypt(password, walletPasswordVerification);
    const hash = window.bitcoin.crypto.sha256(Buffer.from(password, 'utf8')).toString("hex");
    return decrypted == hash
  });

 
}



myWalletService.setWalletPassword = (newPassword) =>{
  const hash = window.bitcoin.crypto.sha256(Buffer.from(newPassword, 'utf8'));
  const walletPasswordVerification = myWalletService.encrypt(newPassword, hash.toString("hex"));

  return myWalletService.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted ? throwError("Wallet password already set") : of(true)),
    switchMap(() => from(window.walletApi.encryptWallet(walletPasswordVerification, (wif) => myWalletService.encrypt(newPassword, wif)))),
    switchMap(() =>{
      
      setTimeout(() =>{
        myWalletService.isWalletEncrypted.next(true);
        myWalletService.myMasternodeUpdated.next();
        myWalletService.myAddressUpdated.next();
      });

      return of(true);
    })
  );
  
}

myWalletService.removeWalletPassword = (password) =>{

  return myWalletService.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ? throwError("Wallet password not set") : of(true)),
    switchMap(() => myWalletService.checkWalletPassword(password) == false ? throwError("Wallet password incorrect") : of(true)),
    switchMap(() => from(window.walletApi.decryptWallet(encryptedWif => myWalletService.decrypt(password, encryptedWif)))),
    switchMap(walletEncrypted =>{


      setTimeout(() =>{
        myWalletService.isWalletEncrypted.next(false);
        myWalletService.myMasternodeUpdated.next();
        myWalletService.myAddressUpdated.next();
      });
      
      
      return of(true);
    }) 
  );
}

myWalletService.changeWalletPassword = (oldPassword, newPassword) =>{

}




myWalletService.myWalletData = combineLatest(from(window.walletApi.getWalletPasswordVerification()), myWalletService.myAddresses, myWalletService.myMasternodes, myWalletService.inputLockStates).pipe(
  map(([walletPasswordVerification, myAddresses,myMasternodes,inputLockStates]) => ({
    walletPasswordVerification, myAddresses, myMasternodes, inputLockStates
  }))
);


myWalletService.importMyWalletData = (myWalletData) =>{

  return from(window.walletApi.importMyWalletdata(myWalletData)).pipe(
    switchMap(result =>{

      setTimeout(() =>{
        myWalletService.myAddressDeleted.next(true);

        myWalletService.myAddressDeleted.next(true);
        myWalletService.myAddressAdded.next(true);
        
        myWalletService.myMasternodeDeleted.next(true);
        myWalletService.myMasternodeAdded.next(true);

        myWalletService.inputLockStateAdded.next(true);
        myWalletService.inputLockStateDeleted.next(true);

        myWalletService.isWalletEncrypted.next(myWalletData.walletPasswordVerification != null && myWalletData.walletPasswordVerification != "");

      });

      return of(true);
    })
  );
   
}

myWalletService.clearMyWalletData = (password) =>{
  return myWalletService.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ? of(true) : (myWalletService.checkWalletPassword(password) == false ? throwError("Wallet password incorrect") : of(true))),
    switchMap(() => from(window.walletApi.clearMyWalletdata())),
    switchMap(() =>{

      setTimeout(() =>{
        myWalletService.myAddressDeleted.next(true);
        myWalletService.myAddressAdded.next(true);
        
        myWalletService.myMasternodeDeleted.next(true);
        myWalletService.myMasternodeAdded.next(true);

        myWalletService.inputLockStateAdded.next(true);
        myWalletService.inputLockStateDeleted.next(true);

        myWalletService.isWalletEncrypted.next(false);

      });
      
      return of(true);
    })
  );
}


myWalletService.encrypt = (password, decrypted) =>{
  var cipher = crypto.createCipher(cryptoAlgorithm,password)
  var crypted = cipher.update(decrypted,'utf8','hex')
  crypted += cipher.final('hex');

  return crypted;
}

myWalletService.decrypt = (password, encrypted) =>{
  var decipher = crypto.createDecipher(cryptoAlgorithm,password)
  var dec = decipher.update(encrypted,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


export default myWalletService;




