
import { BehaviorSubject, combineLatest } from 'rxjs';
import bigDecimal from 'js-big-decimal';

import { mergeMap, map, first  } from 'rxjs/operators';

import BlockchainServices from '../Services/BlockchainServices'
import MyWalletServices from '../Services/MyWalletServices'

import coinSelect from '../Scripts/coinselect/coinselect'; //https://github.com/bitcoinjs/coinselect
import coinSelectUtils from '../Scripts/coinselect/utils'; //https://github.com/bitcoinjs/coinselect

class Transaction { //TODO: think this could be better but will do for now
    constructor() {



        this.coinControl = new BehaviorSubject(false);
        this.selectedInputIds = new BehaviorSubject({});



        this.recipients = new BehaviorSubject([{
            address: "",
            amount: ""
        }]);

        this.changeAddress = new BehaviorSubject("");
        this.feePerByte = new BehaviorSubject(2);


       


        this.selectedInputs = combineLatest(this.selectedInputIds, MyWalletServices.inputAddresses)
        .pipe(
            map(([selectedInputs, inputAddresses]) =>{
                return inputAddresses.flatMap(inputAddress => inputAddress.inputs.filter(input => selectedInputs[input.unspent.txid + "-" + input.unspent.vout]))
            })
        );

        this.selectedInputsTotal = this.selectedInputs.pipe(map(selectedInputs =>{
            var selectedInputsTotal = new bigDecimal('0');
            selectedInputs.forEach(input =>selectedInputsTotal = selectedInputsTotal.add(input.value));

            return parseFloat(selectedInputsTotal.getValue());
        }));



        var targets = this.recipients.pipe(
            map(recipients =>{
                return recipients.map(r =>{
                    return  {
                        address: r.address,
                        value: parseInt(new bigDecimal(r.amount).multiply(new bigDecimal("100000000")).getValue())
                    };
                })
            })
        );


        var coinControlTransactionDetails = () =>{
            return combineLatest(this.selectedInputs, targets, this.feePerByte).pipe(
                map(([selectedInputs, targets, feePerByte]) =>{

                    var utxos = selectedInputs.map(selectedInput =>{
                        return {
                            myAddress:selectedInput.myAddress,
                            txId: selectedInput.unspent.txid,
                            vout: selectedInput.unspent.vout,
                            value: parseInt(selectedInput.satoshi.getValue())
                        };
                    })

                  

                    let { inputs, outputs, fee } = coinSelectUtils.finalize(utxos, targets, feePerByte);

                    return {
                        inputs, 
                        outputs, 
                        fee,
                        change: outputs == null ? null : outputs.find(o => o.address == null)
                    };
                })
            )
        }

        var autoTransactionDetails = () =>{
            return combineLatest(MyWalletServices.inputAddresses, targets, this.feePerByte).pipe(
                map(([inputAddresses, targets, feePerByte]) =>{

                    const utxos = inputAddresses.flatMap(inputAddress => inputAddress.inputs.map(input => {
                        return {
                            myAddress: input.myAddress,
                            txId: input.unspent.txid,
                            vout: input.unspent.vout,
                            value: parseInt(input.satoshi.getValue())
                        };
                    }));
                    
                    
                    let { inputs, outputs, fee } = coinSelect(utxos, targets, feePerByte);

                    return { 
                        inputs, 
                        outputs, 
                        fee,
                        change: outputs == null ? null : outputs.find(o => o.address == null)
                    };
                   
                })
            )
        }


        this.computedTransactionDetails = this.coinControl.pipe(
            mergeMap(coinControl => coinControl ? coinControlTransactionDetails() : autoTransactionDetails())
        )
        
        


        this.fee = this.computedTransactionDetails.pipe(
            map(transactionDetails => transactionDetails.fee)
        );

        this.change = this.computedTransactionDetails.pipe(
            map(transactionDetails => transactionDetails.change == null ? 0 : transactionDetails.change.value)
        );

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

        this.selectedInputIds.next(Object.assign(obj , this.selectedInputIds.value));
    }

    removeSelectedInput = (txid, vout) =>{
        var obj = Object.assign({} , this.selectedInputIds.value);
        delete obj[txid + "-" + vout];

        this.selectedInputIds.next(obj);
    }

    isInputSelected = (txid, vout) =>{
        return this.selectedInputIds.value[txid + "-" + vout] != null;
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
            this.computedTransactionDetails.pipe(first()).subscribe(transactionDetails =>{
                const { inputs, outputs } = transactionDetails;

                let txb = new window.bitcoin.TransactionBuilder(BlockchainServices.Chaincoin);
                txb.setVersion(3);
                inputs.forEach(input => {
                    if (input.myAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
                    {
                        var keyPair = window.bitcoin.ECPair.fromWIF(input.myAddress.WIF, BlockchainServices.Chaincoin);
                        const p2wpkh = window.bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: BlockchainServices.Chaincoin })
                        txb.addInput(input.txId, input.vout, null, p2wpkh.output); 
                    }
                    else
                    {
                        txb.addInput(input.txId, input.vout);
                    }
                });

                outputs.forEach(output => {
                    // watch out, outputs may have been added that you need to provide
                    // an output address/script for
                    if (!output.address) {
                        output.address = this.changeAddress.value
                    }

                    txb.addOutput(output.address, output.value)
                });

                inputs.forEach((input,i) => {

                    var keyPair = window.bitcoin.ECPair.fromWIF(input.myAddress.WIF, BlockchainServices.Chaincoin);
                
                    if (input.myAddress.address.startsWith(BlockchainServices.Chaincoin.bech32))
                    {
                        txb.sign(i, keyPair,null, null,input.value);
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