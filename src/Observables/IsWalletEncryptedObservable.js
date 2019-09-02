

import { throwError, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators'

import MyWalletService from '../Services/MyWalletServices/MyWalletServices'


export default MyWalletService.isWalletEncrypted.pipe(
    first(),
    switchMap(isWalletEncrypted => 
        MyWalletService.isWalletEncrypted.pipe(
            switchMap(newIsWalletEncrypted => isWalletEncrypted != newIsWalletEncrypted ?
                throwError("Wallet encryption changed - cancelling process"):
                of(newIsWalletEncrypted)
            )
        )
    )
);

