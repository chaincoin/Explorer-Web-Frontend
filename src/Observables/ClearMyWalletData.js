

import { of, combineLatest, empty } from 'rxjs';
import { first, switchMap, map, delayWhen } from 'rxjs/operators'


import GetWalletPassword from './GetWalletPasswordObservable';


import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';

import IsWalletEncrypted from './IsWalletEncryptedObservable';



var clearData = (walletPassword) => DialogService.showConfirmation("Remove Wallet Password", "Are you sure? your private keys will be store in plain text putting your Chaincoins at risk")
.pipe(
    switchMap(confirm => confirm != true ?
        of(false):
        MyWalletServices.clearMyWalletData(walletPassword)
    )
)

export default IsWalletEncrypted.pipe(
    switchMap(isWalletEncrypted => isWalletEncrypted == false ?
        clearData(null):
        GetWalletPassword.pipe(
            switchMap(walletPassword => walletPassword == null ?
                of(false) :
                clearData(walletPassword)
            )
        )
    ),
    first()
  )
  
    