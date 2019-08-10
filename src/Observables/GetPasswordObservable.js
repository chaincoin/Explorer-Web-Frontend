

import { filter } from 'rxjs/operators'

import DialogService from '../Services/DialogService';
import PasswordDialog from '../Components/Dialogs/PasswordDialog';

export default (props) => DialogService.showDialog(PasswordDialog, props).pipe(
    filter(password => {
        return password != null && password != ""
    })
)