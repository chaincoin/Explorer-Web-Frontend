

import { throwError } from 'rxjs';
import { filter, switchMap, first } from 'rxjs/operators'

import DialogService from '../Services/DialogService';
import SetWalletPasswordDialog from '../Components/Dialogs/SetWalletPasswordDialog';
import MyWalletService from '../Services/MyWalletServices/MyWalletServices'


export default MyWalletService.isWalletEncrypted.pipe(
    switchMap(isWalletEncrypted => isWalletEncrypted ?
        throwError("Wallet is ready encrypted"):
        DialogService.showDialog(SetWalletPasswordDialog).pipe(
            filter(password => {
                return password != null && password != ""
            })
        ),
    ),
    first()
)

