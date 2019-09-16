

import { switchMap, first, map, catchError } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import SetWalletPasswordDialog from '../Components/Dialogs/SetWalletPasswordDialog';
import IsWalletEncrypted from './IsWalletEncryptedObservable';
import { throwError, of, empty } from 'rxjs';
import WalletAction from './WalletAction';


export default WalletAction(([encrypt, decrypt, walletPassword]) =>{
  if (encrypt != null) return throwError("Wallet already encrypted");

  return DialogService.showDialog(SetWalletPasswordDialog).pipe(
    switchMap(password => MyWalletServices.setWalletPassword(password).pipe(map(result => "Wallet encrypted"))
    )
  )

})
  