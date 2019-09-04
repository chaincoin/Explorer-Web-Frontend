

import { of, combineLatest, empty } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators'


import GetWalletPasswordObservable from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';

import Utils from '../Services/Utils';

export default IsWalletEncrypted.pipe(
    switchMap(walletEncrypted => walletEncrypted == false ?
        DialogService.showConfirmation("Export My Wallet Data","Are you sure? this export contains unencrypted private keys, please be careful"):
        GetWalletPasswordObservable.pipe(
            switchMap((walletPassword) => walletPassword == null ?
                of(null) :
                DialogService.showConfirmation("Export My Wallet Data","Are you sure?")
            )
        )
    ),
    switchMap((confirm) => confirm != true ? 
        of(null) :
        MyWalletServices.myWalletData
    ),
    switchMap((config) =>{
        debugger;
        if (config != null) Utils.stringToFileDownload("ChaincoinExplorer MyWallet.conf", JSON.stringify(config));
        return of(config != null);
    }),
    first()
);