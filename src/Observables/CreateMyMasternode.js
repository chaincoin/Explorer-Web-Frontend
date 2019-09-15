

import { from } from 'rxjs';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import WalletAction from './WalletAction';

export default (myMn) => WalletAction(([encrypt,decrypt]) => {
    if (myMn != null && myMn.privateKey != null)
    {
        myMn = Object.assign({},myMn,{
            privateKey: null,
            encryptedPrivateKey: encrypt(myMn.privateKey)
        });
    }
    return from(MyWalletServices.addMyMasternode(myMn))
})