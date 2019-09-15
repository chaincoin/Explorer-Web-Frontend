

import { switchMap, first, map, catchError } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import SetWalletPasswordDialog from '../Components/Dialogs/SetWalletPasswordDialog';
import IsWalletEncrypted from './IsWalletEncryptedObservable';
import { throwError, of, empty } from 'rxjs';


export default IsWalletEncrypted.pipe(
    switchMap(isWalletEncrypted => isWalletEncrypted == true ?
      throwError("wallet is encrypted"):
      DialogService.showDialog(SetWalletPasswordDialog).pipe(
        switchMap(password => password == null ?
          of(false):
          MyWalletServices.setWalletPassword(password).pipe(map(result => "Wallet encrypted"))
        )
      )
    ),
    first(),
    switchMap(message => message == null ?
      of(null):
      DialogService.showMessage("Success", message)
    ),
    catchError(err => {
        DialogService.showMessage("Error", err).subscribe();
        return empty();
    })
  )
  