

import { filter } from 'rxjs/operators'

import DialogService from '../Services/DialogService';
import WalletPasswordDialog from '../Components/Dialogs/WalletPasswordDialog';

export default DialogService.showDialog(WalletPasswordDialog).pipe(
    filter(password => {
        return password != null && password != ""
    })
)