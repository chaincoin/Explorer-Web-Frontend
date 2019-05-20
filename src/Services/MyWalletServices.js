import { Observable, Subject, combineLatest,  } from 'rxjs';
import { shareReplay, mergeMap, map } from 'rxjs/operators';

import bigDecimal from 'js-big-decimal';

import walletWorker from '../Scripts/walletWorker.js'
import BlockchainServices from './BlockchainServices'


var _walletWorker = null

const walletWorkerCode = walletWorker.toString();
const walletWorkerCodeBlob = new Blob(['('+walletWorkerCode+')()']);
_walletWorker = new Worker(URL.createObjectURL(walletWorkerCodeBlob));


const myMasternodeAdded = new Subject();
const myMasternodeDeleted = new Subject();

const myAddressAdded = new Subject();
const myAddressDeleted = new Subject();

var walletWorkerRequestId = 0;
var pendingWalletWorkerRequests = {}

if (_walletWorker != null)
{
    _walletWorker.onmessage = function(e) {
        var message = e.data;
        var pendingWalletWorkerRequest = pendingWalletWorkerRequests["r" + message.id];
        if (pendingWalletWorkerRequest != null)
        {
            if (message.success)pendingWalletWorkerRequest.resolve(message);
            else pendingWalletWorkerRequest.reject(message);
            clearTimeout(pendingWalletWorkerRequest.timer);
            eval("delete pendingWalletWorkerRequests.r" + message.id);
        }
    
        if (message.event == "addedMasternode") myMasternodeAdded.next(message.data);
        else if (message.event == "deletedMasternode") myMasternodeDeleted.next(message.data);
        else if (message.event == "addedAddress") myAddressAdded.next(message.data);
        else if (message.event == "deletedAddress") myAddressDeleted.next(message.data);
    }
}




function sendWalletWorkerRequest(request)
{
    request.id = walletWorkerRequestId;


    return new Promise(function(resolve, reject)
    {
        var pendingWalletWorkerRequest = {
            request: request,
            resolve: resolve,
            reject: reject,
            timer: setTimeout(reject,30000)
        };
        
    
        _walletWorker.postMessage(request);
    
    
        pendingWalletWorkerRequests["r" + walletWorkerRequestId] = pendingWalletWorkerRequest;
        walletWorkerRequestId++;
    }); 

}


const myAddresses = Observable.create(function(observer) {

    var _response = null;

    var listAddresses = () =>{
        sendWalletWorkerRequest({
            op:"listAddresses"
        })
        .then(response =>{
  
            if (response.success)
            {
                if (_response == null || _response.data.length != response.data.length)
                {
                    _response = response;
                    observer.next(response.data)
                }
            }
        })
        .catch(err => observer.error(err));
    };

    var myAddressAddedSubscription = myAddressAdded.subscribe(listAddresses);
    var myAddressDeletedSubscription = myAddressDeleted.subscribe(listAddresses);

    var intervalId = setInterval(listAddresses, 30000);
    listAddresses();

    return () => {
        clearInterval(intervalId);
        myAddressAddedSubscription.unsubscribe();
        myAddressDeletedSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var addMyAddress = (name, address, WIF) =>{ 

    return sendWalletWorkerRequest({
        op:"createAddress",
        name:name,
        address: address,
        WIF:WIF
    }).then(() => broadcastEvent("myAddressAdded"));
  }

  var deleteMyAddress = (address) =>{ 
    return sendWalletWorkerRequest({
        op:"deleteAddress",
        address: address
    }).then(() => broadcastEvent("myAddressDeleted"));
  }


  


const myMasternodes = Observable.create(function(observer) {

    var _response = null;

    var listMasternodes = () =>{
        sendWalletWorkerRequest({
            op:"listMasternodes"
        })
        .then(response =>{

            if (response.success)
            {
                if (_response == null || _response.data.length != response.data.length)
                {
                    _response = response;
                    observer.next(response.data)
                }
            }
        })
        .catch(err => observer.error(err));
    };

    var myMasternodeAddedSubscription = myMasternodeAdded.subscribe(listMasternodes);
    var myMasternodeDeletedSubscription = myMasternodeDeleted.subscribe(listMasternodes);

    var intervalId = setInterval(listMasternodes, 30000);
    listMasternodes();

    return () => {
        clearInterval(intervalId);
        myMasternodeAddedSubscription.unsubscribe();
        myMasternodeDeletedSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var addMyMasternode = (name, output) =>{ 
    return sendWalletWorkerRequest({
        op:"createMasternode",
        name:name,
        output: output
    }).then(() => broadcastEvent("myMasternodeAdded"));
  }

  var deleteMyMasternode = (output) =>{ 
    return sendWalletWorkerRequest({
        op:"deleteMasternode",
        output: output
    }).then(() => broadcastEvent("myMasternodeDeleted"));
  }


  var inputAddresses = combineLatest(myAddresses, BlockchainServices.blockCount, BlockchainServices.rawMemPool, BlockchainServices.masternodeList)
  .pipe(
  mergeMap(([myAddresses,blockCount, rawMemPool, masternodeList, selectedInputs]) => combineLatest(
    myAddresses.filter(myAddress => myAddress.WIF != null).map(myAddress => 
      combineLatest(
        BlockchainServices.getAddress(myAddress.address),
        BlockchainServices.getAddressUnspent(myAddress.address)
      )
      .pipe(
        map(([address,unspent]) =>{
          return {
            myAddress,
            address: address,
            inputs: unspent.map(unspent => {
              var value = new bigDecimal(unspent.value)
              return {
                myAddress,
                unspent: unspent,
                value: value,
                satoshi: value.multiply(new bigDecimal("100000000")),
                confirmations: blockCount - unspent.blockHeight,
                lockState: null,
                inMemPool: rawMemPool.find(r => r.vin.find(v => v.txid == unspent.txid && v.vout == unspent.vout )),
                inMnList: Object.keys(masternodeList).find(output => output == unspent.txid + "-" + unspent.vout)
              }
            })
          }
        })
      )
    )
  )),
  shareReplay({
    bufferSize: 1,
    refCount: true
  })
);


export default {
    myAddresses,
    addMyAddress,
    deleteMyAddress,

    myMasternodes,
    addMyMasternode,
    deleteMyMasternode,

    inputAddresses

}



var broadcastEvent = (event) =>{

    var version = window.localStorage.getItem(event);

    if (version == null) window.localStorage.setItem(event,0);
    else window.localStorage.setItem(event,version + 1);
}



window.addEventListener('storage', function(e) {

    if(e.key == "myMasternodeAdded") myMasternodeAdded.next();
    else if(e.key == "myMasternodeDeleted") myMasternodeDeleted.next();
    else if(e.key == "myAddressAdded") myAddressAdded.next()
    else if(e.key == "myAddressDeleted") myAddressDeleted.next()
});