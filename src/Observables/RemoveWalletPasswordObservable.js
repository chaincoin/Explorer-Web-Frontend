

import { map,  filter, switchMap, first } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPassword from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable'
import { throwError } from 'rxjs';

export default IsWalletEncrypted.pipe(
  switchMap(isWalletEncrypted => isWalletEncrypted == false ?
    throwError("wallet isn't encrypted"):
    GetWalletPassword
  )
)

  