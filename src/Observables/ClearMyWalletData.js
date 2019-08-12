

import { of, combineLatest, empty } from 'rxjs';
import { first, switchMap, map, delayWhen } from 'rxjs/operators'


import GetWalletPasswordObservable from './GetWalletPasswordObservable';


import MyWalletServices from '../Services/MyWalletServices';
import DialogService from '../Services/DialogService';

import Utils from '../Services/Utils';

export default MyWalletServices.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ?
        of(null):
        GetWalletPasswordObservable
    ),
    delayWhen(() => DialogService.showConfirmation("Clear My Wallet Data","Are you sure? this data cannot be recovered, please be careful!!!")),
    switchMap((walletPassword) => MyWalletServices.clearMyWalletData(walletPassword))
);