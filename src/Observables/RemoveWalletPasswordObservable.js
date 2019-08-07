

import { map,  filter, switchMap } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPassword from './GetWalletPasswordObservable';

export default GetWalletPassword.pipe(
    switchMap(password => DialogService.showConfirmation("Remove Wallet Password", "Are you sure? your private keys will be store in plain text putting your Chaincoins at risk")
      .pipe(
        filter(confirmation => confirmation == true),
        map(confirmation => password)
      )
    ),
    switchMap(password => MyWalletServices.removeWalletPassword(password))
  )