

import { of } from 'rxjs';
import { map,  filter, switchMap } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices';
import GetWalletPassword from './GetWalletPasswordObservable';


export default (privateKey) =>{

  return MyWalletServices.isWalletEncrypted.pipe(
    switchMap(walletEncrypted => walletEncrypted ?
      GetWalletPassword.pipe(
        map(password => MyWalletServices.encrypt(password, privateKey))
      ):      
      of(null)
    )
  );
}