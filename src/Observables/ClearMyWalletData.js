

import { of, combineLatest, empty, throwError } from 'rxjs';
import { first, switchMap, map, delayWhen } from 'rxjs/operators'


import GetWalletPassword from './GetWalletPasswordObservable';


import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';

import IsWalletEncrypted from './IsWalletEncryptedObservable';
import WalletAction from './WalletAction';





export default WalletAction(([encrypt, decrypt, walletPassword]) => DialogService.showConfirmation("Clear My Wallet Data", "Are you sure? your private keys cannot be recovered!!!")
.pipe(
    switchMap(confirm => confirm != true ?
        throwError("Cancelled by user"):
        MyWalletServices.clearMyWalletData(walletPassword).pipe(map(() => "My Wallet data cleared"))
    )
))