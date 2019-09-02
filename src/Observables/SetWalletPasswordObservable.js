

import { filter, switchMap, first } from 'rxjs/operators'

import DialogService from '../Services/DialogService';
import SetWalletPasswordDialog from '../Components/Dialogs/SetWalletPasswordDialog';
import isWalletEncryptedObservable from './IsWalletEncryptedObservable';
import { throwError, of } from 'rxjs';


export default isWalletEncryptedObservable.pipe(
    switchMap(isWalletEncrypted => isWalletEncrypted == true ?
        throwError("wallet is encrypted"):
        of(null)
    ),
    switchMap(() => DialogService.showDialog(SetWalletPasswordDialog))
)
