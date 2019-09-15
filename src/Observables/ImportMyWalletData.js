

import { of, combineLatest, throwError } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPasswordObservable from './GetWalletPasswordObservable';
import UploadFileDialog from '../Components/Dialogs/UploadFileDialog';
import isWalletEncryptedObservable from './IsWalletEncryptedObservable';
import WalletAction from './WalletAction';



export default WalletAction(([encrypt, decrypt, password]) =>{

    return DialogService.showConfirmation("Import My Wallet Data","Are you sure? this will overwrite any current configuration").pipe(
      switchMap(confirmation => confirmation != true ?
        throwError("Cancelled by user"):
        DialogService.showDialog(UploadFileDialog,{
            title: "Import My Wallet Data",
            message: "Select My Wallet Data export file",
            checkFileContent:(fileDataJson) =>{
                try{
                    var fileData = JSON.parse(fileDataJson);
                    return of(fileData.myAddresses != null && fileData.myMasternodes != null && fileData.inputLockStates != null);
                }
                catch(ex)
                {}
                return of(false)
            }
        }).pipe(
            switchMap(fileDataJson => fileDataJson == null?
                of(null)
                : MyWalletServices.importMyWalletData(JSON.parse(fileDataJson))
            )
        )
      )
    )
  })

