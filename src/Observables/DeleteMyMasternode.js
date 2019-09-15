

import { from, throwError } from 'rxjs';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import WalletAction from './WalletAction';
import { switchMap } from 'rxjs/operators';
import DialogService from '../Services/DialogService';

export default (output) => WalletAction(([encrypt,decrypt]) => {

    return MyWalletServices.myMasternode(output).pipe(
        switchMap(myMn => DialogService.showConfirmation("Remove My Masternode",myMn.encryptedPrivateKey == null && myMn.privateKey == null ? "Are you sure?" : "Are you sure? the private key can not be recovered")),
        switchMap(confirmation => confirmation == false ?
            throwError("Cancelled by user") :
            from(MyWalletServices.deleteMyMasternode(output))
        )
    ) 
})