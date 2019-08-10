

import { of, combineLatest } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPasswordObservable from './GetWalletPasswordObservable';


export default MyWalletServices.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ?
        DialogService.showConfirmation("Export My Wallet Data","Are you sure? this export contains unencrypted private keys, please be careful"):
        GetWalletPasswordObservable.pipe(
            switchMap(() => DialogService.showConfirmation("Export My Wallet Data","Are you sure?"))
        )
    ),
    switchMap(() => MyWalletServices.myWalletExportData),
    first()
)