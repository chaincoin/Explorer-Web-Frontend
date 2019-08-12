

import { of, combineLatest } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators'

import MyWalletServices from '../Services/MyWalletServices';
import DialogService from '../Services/DialogService';
import GetWalletPasswordObservable from './GetWalletPasswordObservable';
import UploadFileDialog from '../Components/Dialogs/UploadFileDialog';


export default MyWalletServices.isWalletEncrypted.pipe(
    first(),
    switchMap(walletEncrypted => walletEncrypted == false ?
        of(null):
        GetWalletPasswordObservable
    ),
    switchMap(() => DialogService.showConfirmation("Import My Wallet Data","Are you sure? this will overwrite any current configuration")),
    switchMap(() => DialogService.showDialog(UploadFileDialog,{
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
    })),
    first(),
    switchMap((fileDataJson) => MyWalletServices.importMyWalletData(JSON.parse(fileDataJson)))
)