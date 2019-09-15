

import { of } from 'rxjs'

import GetPassword from './GetPasswordObservable'

import BlockchainServices from '../Services/BlockchainServices'

export default GetPassword({
    title:"Set Masternode Private Key",
    passwordLabel: "Private Key",
    checkPassword: (wif) =>{

        try{
            var keyPair = window.bitcoin.ECPair.fromWIF(wif, BlockchainServices.Chaincoin); 
            return of(true);
        }
        catch(ex)
        {
            return of(false);
        }
        
    }
})

