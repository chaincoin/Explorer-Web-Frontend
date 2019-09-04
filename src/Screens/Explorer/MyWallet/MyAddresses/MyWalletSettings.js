import React from 'react';

import Button from '@material-ui/core/Button';


import SetWalletPassword from '../../../../Observables/SetWalletPasswordObservable';
import RemoveWalletPassword from '../../../../Observables/RemoveWalletPasswordObservable';
import ExportMyWalletData from '../../../../Observables/ExportMyWalletData';
import ImportMyWalletData from '../../../../Observables/ImportMyWalletData';
import ClearMyWalletData from '../../../../Observables/ClearMyWalletData';

import MyWalletServices from '../../../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../../../Services/DialogService';




export default (props) =>{
    
    var [isWalletEncrypted, setIsWalletEncrypted] = React.useState(null);


    React.useEffect(() => {

        const subscription = MyWalletServices.isWalletEncrypted.subscribe((isWalletEncrypted) =>{
            setIsWalletEncrypted(isWalletEncrypted);

        });
        
        return () =>{
          subscription.unsubscribe();
        }
      }, []);


    return (
        <React.Fragment>
            <div>
                <h3>Encryption</h3>
                <p>

                </p>
                <Button variant="contained" color="primary" disabled={isWalletEncrypted == true}  onClick={() => SetWalletPassword.subscribe(
                    (result) =>{
                        if (result == true) DialogService.showMessage("Success","Wallet Encrypted").subscribe();
                    },
                    (error) =>{
                        debugger;
                        DialogService.showMessage("Error",error).subscribe();
                    })
                }>
                    Set Wallet Password
                </Button>
                <Button variant="contained" color="primary" disabled={isWalletEncrypted == false} onClick={() => RemoveWalletPassword.subscribe(
                    (result) =>{
                        if (result == true) DialogService.showMessage("Success","Wallet unencrypted").subscribe();
                    },
                    (error) =>{
                        DialogService.showMessage("Error",error).subscribe();
                    })
                }>
                    Remove Wallet Password
                </Button>
            </div>

            <div>
                <h3>Backup/Restore</h3>
                <p>

                </p>
                <Button variant="contained" color="primary"  onClick={() => ImportMyWalletData.subscribe()}>
                    Import My Wallet Data
                </Button>
                <Button variant="contained" color="primary"  onClick={() => ExportMyWalletData.subscribe()}>
                    Export My Wallet Data
                </Button>
            </div>

            <div>
                <h3>Auto Backup</h3>
                <p>
                    Not implemented
                </p>
                <Button disabled="true" variant="contained" color="primary"  onClick={() => SetWalletPassword.subscribe()}>
                    Enable Auto Backup
                </Button>
                <Button disabled="true" variant="contained" color="primary"  onClick={() => SetWalletPassword.subscribe()}>
                    Disable Auto Backup
                </Button>
            </div>

            <div>
                <h3>Clear My Wallet Data</h3>
                <p>

                </p>
                <Button variant="contained" color="primary"  onClick={() => ClearMyWalletData.subscribe(
                    (result) =>{
                        if (result == true) DialogService.showMessage("Success","Wallet data cleared").subscribe();
                    },
                    (error) =>{
                        DialogService.showMessage("Error",error).subscribe();
                    })}>
                    Clear My Wallet Data
                </Button>
            </div>

        </React.Fragment>
    )
    
}
 