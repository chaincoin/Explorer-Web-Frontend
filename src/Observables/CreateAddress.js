

import { from } from 'rxjs';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import WalletAction from './WalletAction';

export default (address) => WalletAction(([encrypt,decrypt]) => {
    if (encrypt != null && address.WIF != null)
    {
        address = Object.assign({},address,{
            WIF: null,
            encryptedWIF: encrypt(address.WIF)
        });
    }
    return from(MyWalletServices.addMyAddress(address))
})