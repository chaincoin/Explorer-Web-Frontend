
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import bigDecimal from 'js-big-decimal';

import { mergeMap, map, first, switchMap  } from 'rxjs/operators';

import BlockchainServices from '../Services/BlockchainServices'
import MyWalletServices from '../Services/MyWalletServices'

import coinSelect from '../Scripts/coinselect/coinselect'; //https://github.com/bitcoinjs/coinselect
import coinSelectUtils from '../Scripts/coinselect/utils'; //https://github.com/bitcoinjs/coinselect
import { Input } from '@material-ui/core';

class Transaction { //TODO: think this could be better but will do for now
    constructor() {


        var TX_EMPTY_SIZE = 4 + 1 + 1 + 4
        var TX_INPUT_BASE = 32 + 4 + 1 + 4
        var TX_INPUT_PUBKEYHASH = 106
        var TX_OUTPUT_BASE = 8 + 1
        var TX_OUTPUT_PUBKEYHASH = 25



        this.coinControl = new BehaviorSubject(false);
        this.userSelectedInputIds = new BehaviorSubject({});



        this.recipients = new BehaviorSubject([{
            address: "",
            amount: ""
        }]);

        this.changeAddress = new BehaviorSubject("");
        this.feePerByte = new BehaviorSubject(2); //TODO: this shoudl use estimate smart fee api

        

        this.outputs = this.recipients.pipe(
            map(recipients => recipients.map(r =>{
                return {
                    address: r.address,
                    value: parseInt(new bigDecimal(r.amount).multiply(new bigDecimal("100000000")).getValue())
                };
            })
        ))



        var allInputs = MyWalletServices.inputAddresses.pipe(
            map(inputAddresses => 
                inputAddresses.flatMap(inputAddress => inputAddress.inputs.filter(input => input.disabled != true))
            )
        )

        var autoSelectedInputs = combineLatest(this.outputs, allInputs, this.feePerByte)
        .pipe(
            map(([targets, allInputs, feePerByte]) =>{

                const utxos = allInputs.map(input =>{
                    return {
                        input: input,
                        txId: input.unspent.txid,
                        vout: input.unspent.vout,
                        value: input.satoshi
                    };
                });


                let { inputs, outputs, fee } = coinSelect(utxos, targets, feePerByte);

                if (inputs == null) return allInputs;
                return inputs.map(input => input.input); 
            })
        );

        var userSelectedInputs = combineLatest(this.userSelectedInputIds, allInputs)
        .pipe(
            map(([userSelectedInputIds, allInputs]) => {
                return allInputs.filter(input => userSelectedInputIds[input.unspent.txid + "-" + input.unspent.vout] != null);
            })
        );
       
        this.selectedInputs = this.coinControl.pipe(
            switchMap(coinControl => {
                if (coinControl == true) return  userSelectedInputs; 
                else return autoSelectedInputs;
            })
        );
        

        this.selectedInputsTotal = this.selectedInputs.pipe(map(selectedInputs =>{
            var selectedInputsTotal = new bigDecimal('0');

            selectedInputs.forEach(input =>selectedInputsTotal = selectedInputsTotal.add(input.value));

            return parseFloat(selectedInputsTotal.getValue());
        }));

        

        this.transactionDetails = combineLatest(this.selectedInputs, this.outputs, this.feePerByte).pipe(
            map(([selectedInputs, outputs, feePerByte]) =>{


                var inputTotal = 0;
                selectedInputs.forEach(selectedInput => inputTotal = inputTotal + selectedInput.satoshi);

                var ouputTotal = 0;
                outputs.forEach(r => {
                    ouputTotal = ouputTotal + r.value;
                });


                var inputBytes = selectedInputs.length * (TX_INPUT_BASE + TX_INPUT_PUBKEYHASH);
                var outputBytes = outputs.length * (TX_OUTPUT_BASE + TX_OUTPUT_PUBKEYHASH);

                var bytes = TX_EMPTY_SIZE + inputBytes + outputBytes;
                var fee = bytes * feePerByte;


                if (inputTotal < ouputTotal){
                    return {
                        error: "Not enough CHC",
                        fee,
                        bytes,
                        dust: true,
                        change:0
                    }
                }

                

                if (inputTotal < fee + ouputTotal)
                {
                    return {
                        error: "Not enough CHC for the fee",
                        fee,
                        bytes,
                        dust: true,
                        change:0
                    }
                }

                var dustThreshold = TX_INPUT_BASE + TX_INPUT_PUBKEYHASH;
                var change = inputTotal - (fee + ouputTotal);
                var dust = change < dust;


                //let { inputs, outputs, fee } = coinSelectUtils.finalize(utxos, targets, feePerByte);

                return {
                    error:"",
                    fee, 
                    bytes, 
                    dust,
                    change
                };
            })
        );
        
        


        this.bytes = this.transactionDetails.pipe(
            map(transactionDetails => transactionDetails.bytes)
        )
        
        this.fee = this.transactionDetails.pipe(
            map(transactionDetails => transactionDetails.fee)
        )

        this.change = this.transactionDetails.pipe(
            map(transactionDetails => transactionDetails.change)
        )

    }

    setChangeAddress = (changeAddress) =>{
        this.changeAddress.next(changeAddress);
    }

    addRecipient = () =>{
        this.recipients.next(this.recipients.value.concat([{
            address: "",
            amount: ""
        }]));
    }

    removeRecipient = (recipient) =>{
        this.recipients.next(this.recipients.value.filter(r => r != recipient));
    }

    updateRecipient = (i, recipient) =>{
        var newRecipients = this.recipients.value.slice();
        newRecipients[i] = Object.assign(newRecipients[i], recipient);

        this.recipients.next(newRecipients);
    }

    addSelectedInput = (txid, vout) =>{
        var obj = {};
        obj[txid + "-" + vout] = {};

        this.userSelectedInputIds.next(Object.assign(obj , this.userSelectedInputIds.value));
    }

    removeSelectedInput = (txid, vout) =>{
        var obj = Object.assign({} , this.userSelectedInputIds.value);
        delete obj[txid + "-" + vout];

        this.userSelectedInputIds.next(obj);
    }

    setCoinControl = (coinControl) =>{
        return this.coinControl.next(coinControl);
    }


    clear = () =>{
        this.recipients.next([{
            address: "",
            amount: ""
        }]);

        this.selectedInputIds.next({});
    }

    send = () =>{
        return new Promise((resolve, reject) =>{
            combineLatest(this.transactionDetails, this.selectedInputs, this.outputs, this.changeAddress).pipe(first()).subscribe(([transactionDetails,inputs, outputs, changeAddress]) =>{
                const { change, dust } = transactionDetails;

                let txb = new window.bitcoin.TransactionBuilder(BlockchainServices.Chaincoin);
                txb.setVersion(3);
                inputs.forEach(input => {
                    if (input.myAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
                    {
                        debugger;
                        var keyPair = window.bitcoin.ECPair.fromWIF(input.myAddress.WIF, BlockchainServices.Chaincoin);
                        const p2wpkh = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin })
                        txb.addInput(input.unspent.txid, input.unspent.vout, null, p2wpkh.output); 
                    }
                    else
                    {
                        txb.addInput(input.unspent.txid, input.unspent.vout);
                    }
                });

                outputs.forEach(output => {
                    txb.addOutput(output.address, output.value)
                });

                if (dust == false) {
                    txb.addOutput(changeAddress, change)
                }

                inputs.forEach((input,i) => {

                    var keyPair = window.bitcoin.ECPair.fromWIF(input.myAddress.WIF, BlockchainServices.Chaincoin);
                
                    if (input.myAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
                    {
                        txb.sign(i, keyPair,null, null,input.satoshi);
                    }
                    else
                    {
                        txb.sign(i, keyPair);
                    }
                });

                var transaction = txb.build();
                var hex = transaction.toHex();


                BlockchainServices.sendRawTransaction(hex, true).then(resolve).catch(reject);

            }, reject);
        })
    };
}

export default  Transaction;