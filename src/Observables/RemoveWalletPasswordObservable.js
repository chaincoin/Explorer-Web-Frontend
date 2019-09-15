

import { throwError, of, empty } from 'rxjs';
import { map,  filter, switchMap, first } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPassword from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable';
import WalletAction from './WalletAction';

export default WalletAction(([encrypt, decrypt, password]) =>{
  return DialogService.showConfirmation("Remove Wallet Password", "Are you sure? your private keys will be store in plain text putting your Chaincoins at risk").pipe(
    switchMap(confirmation => confirmation != true ?
      throwError("Cancelled by user"):
      MyWalletServices.removeWalletPassword(password)
    )
  )
})

