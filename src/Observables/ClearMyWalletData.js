

import { of, combineLatest, empty, throwError } from 'rxjs';
import { first, switchMap, map, delayWhen } from 'rxjs/operators'


import GetWalletPassword from './GetWalletPasswordObservable';


import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';

import IsWalletEncrypted from './IsWalletEncryptedObservable';
import WalletAction from './WalletAction';





export default WalletAction(([encrypt, decrypt, walletPassword]) => DialogService.showConfirmation("Remove Wallet Password", "Are you sure? your private keys will be store in plain text putting your Chaincoins at risk")
.pipe(
    switchMap(confirm => confirm != true ?
        throwError("Cancelled by user"):
        MyWalletServices.clearMyWalletData(walletPassword).pipe(map(() => "My Wallet data cleared"))
    )
))