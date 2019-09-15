

import { of } from 'rxjs'

import GetPassword from './GetPasswordObservable'

import BlockchainServices from '../Services/BlockchainServices'

export default (address) => GetPassword({
    title:"Set WIF",
    passwordLabel: "WIF",
    checkPassword: (wif) =>{
        try{
            var keyPair = window.bitcoin.ECPair.fromWIF(wif, BlockchainServices.Chaincoin); 
            var p2wpkhAddress = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address; // eslint-disable-line no-undef
            var p2pkhAddress = window.bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }).address;
            var p2shAddress = window.bitcoin.payments.p2sh({redeem: window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin }), network: BlockchainServices.Chaincoin}).address
          
            return of(address == p2wpkhAddress || address == p2pkhAddress || address == p2shAddress);
        }
        catch(ex)
        {
            return of (false);
        }
        
    }
})

