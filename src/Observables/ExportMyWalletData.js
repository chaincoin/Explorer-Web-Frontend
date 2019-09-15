

import { of, combineLatest, empty, throwError } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators'


import GetWalletPasswordObservable from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';

import Utils from '../Services/Utils';
import WalletAction from './WalletAction';

export default WalletAction(() =>{

    return IsWalletEncrypted.pipe(
        switchMap(walletEncrypted => walletEncrypted == false ?
            DialogService.showConfirmation("Export My Wallet Data","Are you sure? this export contains unencrypted private keys, please be careful"):
            of(true)
        ),
        switchMap((confirm) => confirm != true ? 
            throwError("Cancelled by user") :
            MyWalletServices.myWalletData
        ),
        switchMap((config) =>{
            Utils.stringToFileDownload("ChaincoinExplorer MyWallet.conf", JSON.stringify(config))
            return of(null);
        })
    )
})

