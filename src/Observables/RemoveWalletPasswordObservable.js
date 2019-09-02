

import { map,  filter, switchMap, first } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPassword from './GetWalletPasswordObservable';
import { throwError } from 'rxjs';

export default MyWalletServices.isWalletEncrypted.pipe(
  switchMap(isWalletEncrypted => isWalletEncrypted == false ?
    throwError("Wallet is ready unencrypted"):
    GetWalletPassword.pipe(
      switchMap(password => DialogService.showConfirmation("Remove Wallet Password", "Are you sure? your private keys will be store in plain text putting your Chaincoins at risk")
        .pipe(
          filter(confirmation => confirmation == true),
          map(confirmation => password)
        )
      ),
      switchMap(password => MyWalletServices.removeWalletPassword(password))
    )
  ),
  first()
)

  