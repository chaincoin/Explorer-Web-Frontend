

import { of } from 'rxjs';
import { map,  first, switchMap } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import GetWalletPassword from './GetWalletPasswordObservable';


export default (privateKey) =>{

  return MyWalletServices.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted ?
      GetWalletPassword.pipe(
        map(password => MyWalletServices.encrypt(password, privateKey))
      ):      
      of(null)
    )
  );
}