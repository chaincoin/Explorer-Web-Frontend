

import { from, of, throwError } from 'rxjs';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import WalletAction from './WalletAction';
import { switchMap } from 'rxjs/operators';
import DialogService from '../Services/DialogService';

export default (myMn) => WalletAction(([encrypt,decrypt]) => {
    if (myMn != null && myMn.privateKey != null)
    {
        myMn = Object.assign({},myMn,{
            privateKey: null,
            encryptedPrivateKey: encrypt(myMn.privateKey)
        });
    }


    return MyWalletServices.myMasternode(myMn.output).pipe(
        switchMap(dbMyMn => (dbMyMn.privateKey != null || dbMyMn.encryptedPrivateKey != null) && (("privateKey" in myMn && myMn.privateKey == null) || ("encryptedPrivateKey" in myMn && myMn.encryptedPrivateKey == null)) ? 
            DialogService.showConfirmation("Remove My Masternode","Are you sure? the private key can not be recovered") :
            of(true)
        ),
        switchMap(confirmation => confirmation == false ?
            throwError("Cancelled by user") :
            from(MyWalletServices.UpdateMyMasternode(myMn))
        )
    ) 
})