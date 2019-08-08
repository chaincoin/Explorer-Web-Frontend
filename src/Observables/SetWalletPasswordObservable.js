

import { filter } from 'rxjs/operators'

import DialogService from '../Services/DialogService';
import SetWalletPasswordDialog from '../Components/Dialogs/SetWalletPasswordDialog';

export default DialogService.showDialog(SetWalletPasswordDialog).pipe(
    filter(password => {
        return password != null && password != ""
    })
)