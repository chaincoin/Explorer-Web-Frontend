

import { switchMap, first } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import SetWalletPasswordDialog from '../Components/Dialogs/SetWalletPasswordDialog';
import IsWalletEncrypted from './IsWalletEncryptedObservable';
import { throwError, of } from 'rxjs';


export default IsWalletEncrypted.pipe(
    switchMap(isWalletEncrypted => isWalletEncrypted == true ?
      throwError("wallet is encrypted"):
      DialogService.showDialog(SetWalletPasswordDialog).pipe(
        switchMap(password => password == null ?
          of(false):
          MyWalletServices.setWalletPassword(password)
        )
      )
    ),
    first()
  )
  