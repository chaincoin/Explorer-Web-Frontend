import { Observable, Subject  } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import walletWorker from '../Scripts/walletWorker.js'



const walletWorkerCode = walletWorker.toString();
const walletWorkerCodeBlob = new Blob(['('+walletWorkerCode+')()']);
var _walletWorker = new Worker(URL.createObjectURL(walletWorkerCodeBlob));


var myMasternodeAdded = new Subject();
var myMasternodeDeleted = new Subject();

var walletWorkerRequestId = 0;
var pendingWalletWorkerRequests = {}

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




  


const myMasternodes = Observable.create(function(observer) {

    var _masternodes = null;

    var listMasternodes = () =>{
        sendWalletWorkerRequest({
            op:"listMasternodes"
        })
        .then(masternodes =>{
            _masternodes = masternodes;
            observer.next(masternodes);
        })
        .catch(err => observer.error(err));
    };

    var myMasternodeAddedSubscription = myMasternodeAdded.subscribe(()=>{
        listMasternodes();
    });
    var myMasternodeDeletedSubscription = myMasternodeDeleted.subscribe(()=>{
        listMasternodes();
    });

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


  var addMyMasternode = (name, output) =>{ //TODO: get this fuction to trigger an update to myMasternodes Observable
    return sendWalletWorkerRequest({
        op:"createMasternode",
        name:name,
        output: output
    });
  }

  var deleteMyMasternode = (output) =>{ //TODO: get this fuction to trigger an update to myMasternodes Observable
    return sendWalletWorkerRequest({
        op:"deleteMasternode",
        output: output
    });
  }


export default {
    myMasternodes,
    addMyMasternode,
    deleteMyMasternode

}