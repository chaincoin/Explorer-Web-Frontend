

import { throwError, of } from 'rxjs';
import { map,  filter, switchMap, first } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPassword from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable';

export default IsWalletEncrypted.pipe(
  switchMap(isWalletEncrypted => isWalletEncrypted == false ?
    throwError("wallet isn't encrypted"):
    GetWalletPassword.pipe(
      switchMap(password => password == null ?
        of(false):
        DialogService.showConfirmation("Remove Wallet Password", "Are you sure? your private keys will be store in plain text putting your Chaincoins at risk")
        .pipe(
          switchMap(confirmation => confirmation != true ?
            of(false):
            MyWalletServices.removeWalletPassword(password)
          )
        )
      )
    )
  ),
  first()
)

  