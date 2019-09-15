

import { from, throwError } from 'rxjs';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import WalletAction from './WalletAction';
import DialogService from '../Services/DialogService';
import { switchMap } from 'rxjs/operators';

export default (address) => WalletAction(([encrypt,decrypt]) => {

    return MyWalletServices.myAddress(address).pipe(
        switchMap(myAddress => DialogService.showConfirmation("Remove My Address", myAddress.WIF == null && myAddress.encryptedWIF == null ? "Are you sure?" : "Are you sure? the private key can not be recovered")),
        switchMap(confirmation => confirmation == false ?
            throwError("Cancelled by user") :
            from(MyWalletServices.deleteMyAddress(address))
        )
    );
})