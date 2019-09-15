

import { from, of, throwError } from 'rxjs';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import WalletAction from './WalletAction';
import { switchMap } from 'rxjs/operators';
import DialogService from '../Services/DialogService';

export default (address) => WalletAction(([encrypt,decrypt]) => {
    if (encrypt != null && address.WIF != null)
    {
        address = Object.assign({},address,{
            WIF: null,
            encryptedWIF: encrypt(address.WIF)
        });
    }
    
    

    return MyWalletServices.myAddress(address.address).pipe(
        switchMap(dbMyAddress => (dbMyAddress.WIF != null || dbMyAddress.encryptedWIF != null) && (("WIF" in address && address.WIF == null) || ("encryptedWIF" in address && address.encryptedWIF == null)) ? 
            DialogService.showConfirmation("Update My Address","Are you sure? the private key can not be recovered") :
            of(true)
        ),
        switchMap(confirmation => confirmation == false ?
            throwError("Cancelled by user") :
            from(MyWalletServices.updateMyAddress(address))
        )
    ) 
    
    
    
})