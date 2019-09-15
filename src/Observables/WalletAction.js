

import { of, combineLatest, empty } from 'rxjs';
import { first, switchMap, map, catchError } from 'rxjs/operators'


import GetWalletPasswordObservable from './GetWalletPasswordObservable';
import IsWalletEncrypted from './IsWalletEncryptedObservable';

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';

import Utils from '../Services/Utils';

export default (action) => IsWalletEncrypted.pipe(
    switchMap(walletEncrypted => walletEncrypted == false ?
        of([]) :
        GetWalletPasswordObservable.pipe(
            map(walletPassword => [(string) => MyWalletServices.encrypt(walletPassword, string), (string) => MyWalletServices.decrypt(walletPassword, string), walletPassword])
        )
    ),
    switchMap(data => action(data)),
    first(),
    switchMap(message => message == null ?
        of(null):
        DialogService.showMessage("Success", message)
    ),
    catchError(err => {
        DialogService.showMessage("Error", err).subscribe();
        return empty();
    })
);