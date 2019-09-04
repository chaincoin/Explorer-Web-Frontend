

import { of } from 'rxjs';
import { map,  first, switchMap } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import GetWalletPassword from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable';

export default (privateKey) =>{

  return IsWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted ?
      GetWalletPassword.pipe(
        map(password => password == null ?
          null :
          MyWalletServices.encrypt(password, privateKey))
      ):      
      of(null)
    )
  );
}