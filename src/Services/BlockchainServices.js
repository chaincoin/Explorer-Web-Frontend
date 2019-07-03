import { Observable, Subject, from, interval } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import axios from 'axios'
import Environment from './Environment';



var _websocket = null;
var websocketRequestId = 0;
var pendingWebsocketRequests = {};
var websocketSubscriptionId = 0;

var websocketMessage = new Subject();

function sendWebsocketRequest(request)
{
    request.id = websocketRequestId;

    return new Promise((resolve, reject) =>{
      var pendingWebsocketRequest = {
        request: request,
        resolve: resolve,
        reject: reject,
        timer: setTimeout(function(){
            reject();
        },30000)
      };
      

      _websocket.send(JSON.stringify(request));


      pendingWebsocketRequests["r" + websocketRequestId] = pendingWebsocketRequest;
      websocketRequestId++;
    });
}


var getSubscriptionId = () =>{
  websocketSubscriptionId++;
  return websocketSubscriptionId;
}

function sendHttpRequest(request)
{
  var queryParms = "?_=" + new Date().getTime();
  for (var key in request) {
      if (!request.hasOwnProperty(key) || key == 'op') continue;
      queryParms = queryParms + "&" + key + "=" + request[key];
  }

  return axios.get(Environment.blockchainApiUrl + "/" + request.op + queryParms)
  .then(res => res.data);
}

function sendRequest(request)
{
    if (_websocket != null) return sendWebsocketRequest(request).then((result) => result.data);
    else return sendHttpRequest(request);
}


const webSocket = Observable.create(function(observer) {

  observer.next(false);


  var websocketRetryTimer = 500; 


  var startWebsocket = () =>{
    var tempWebsocket = new WebSocket(Environment.webServicesApiUrl);
    // Connection opened

    tempWebsocket.addEventListener('open', function (event) {
      _websocket = tempWebsocket; 
      websocketRequestId = 0; //reset
      websocketSubscriptionId = 0; //reset
      websocketRetryTimer = 500; //reset
      pendingWebsocketRequests = {};
      observer.next(true);
    });

    // Listen for messages
    tempWebsocket.addEventListener('message', function (event) { //TODO: how to handle subscriptions
      var message = JSON.parse(event.data);
                   
      var pendingWebsocketRequest = pendingWebsocketRequests["r" + message.id];
      if (pendingWebsocketRequest != null)
      {
          if (message.success)pendingWebsocketRequest.resolve(message);
          else pendingWebsocketRequest.reject(message);
          clearTimeout(pendingWebsocketRequest.timer);
          eval("delete pendingWebsocketRequests.r" + message.id);
      }

      websocketMessage.next(message);
    });

    tempWebsocket.addEventListener('close', function (event) {
      observer.next(false);
      _websocket = null;

      for (var key in pendingWebsocketRequests) {
        // skip loop if the property is from prototype
        if (!pendingWebsocketRequests.hasOwnProperty(key)) continue;
        clearTimeout(pendingWebsocketRequests[key].timer);
        pendingWebsocketRequests[key].reject();
      }



      setTimeout(startWebsocket,websocketRetryTimer);
      if (websocketRetryTimer < 10000) websocketRetryTimer = websocketRetryTimer * 2; //while retry is less than 10 seconds then 
    });
  }

  startWebsocket();


}).pipe(shareReplay({
  bufferSize: 1,
  refCount: false
}));



const BlockCount = webSocket.pipe(
  switchMap(webSocket => webSocket ?
    Observable.create(function(observer) {

      var subscriptionId = getSubscriptionId();

      _websocket.send(JSON.stringify({op: "BlockCountSubscribe", subscriptionId: subscriptionId}));
      var websocketMessageSubscription = websocketMessage.subscribe(message =>{
        if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
      });

      return () =>{
        websocketMessageSubscription.unsubscribe();
        _websocket.send(JSON.stringify({op: "BlockCountUnsubscribe"}));
      };
    }):
    interval(30000).pipe(switchMap(blockCount => from(sendRequest({
      op: "getBlockCount"
    }))))
  ),
  shareReplay({
    bufferSize: 1,
    refCount: true
  })
);


  var blockObservables = {}

  var getBlock = (hash) =>{ //TODO: This is a memory leak

    var blockObservable = blockObservables[hash];
    

    if (blockObservable == null){

      blockObservable = webSocket.pipe(
        switchMap(webSocket => webSocket ?
          Observable.create(function(observer) {

            var subscriptionId = getSubscriptionId();

            _websocket.send(JSON.stringify({op: "BlockExtendedSubscribe", subscriptionId: subscriptionId, hash:hash}));
            var websocketMessageSubscription = websocketMessage.subscribe(message =>{
              if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
            });

            return () =>{
              websocketMessageSubscription.unsubscribe();
              _websocket.send(JSON.stringify({op: "BlockExtendedUnsubscribe", hash:hash}));
            };
          }):
          BlockCount.pipe(switchMap(blockCount => from(sendRequest({
            op: "getBlockExtended",
            hash: hash
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      blockObservables[hash] = blockObservable;
    } 

    return blockObservable;
  }

  var getBlocks = (blockPos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getBlocksExtended",
      blockId: blockPos,
      pageSize: rowsPerPage,
      extended:true
    })
  }


  var blocksObservables = {}

  var getBlocks = (blockId, pageSize) =>{ //TODO: This is a memory leak

    var observable = blocksObservables[blockId + "-" + pageSize];
    

    if (observable == null){

      observable = webSocket.pipe(
        switchMap(webSocket => webSocket ?
          Observable.create(function(observer) {

            var subscriptionId = getSubscriptionId();

            _websocket.send(JSON.stringify({op: "BlocksExtendedSubscribe", subscriptionId: subscriptionId, blockId:blockId,pageSize:pageSize}));
            var websocketMessageSubscription = websocketMessage.subscribe(message =>{
              if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
            });

            return () =>{
              websocketMessageSubscription.unsubscribe();
              _websocket.send(JSON.stringify({op: "BlocksExtendedUnsubscribe", blockId:blockId,pageSize:pageSize }));
            };
          }):
          BlockCount.pipe(switchMap(blockCount => from(sendRequest({
            op: "getBlocksExtended",
            blockId: blockId,
            pageSize: pageSize,
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      blocksObservables[blockId + "-" + pageSize] = observable;
    } 

    return observable;
  }

  var transactionObservables = {}

  var getTransaction = (txid) =>{ //TODO: This is a memory leak

    var transactionObservable = transactionObservables[txid];

    if (transactionObservable == null)
    {
      transactionObservable = webSocket.pipe(
        switchMap(webSocket => webSocket ?
          Observable.create(function(observer) {

            var subscriptionId = getSubscriptionId();

            _websocket.send(JSON.stringify({op: "TransactionExtendedSubscribe", subscriptionId: subscriptionId, transactionId:txid}));
            var websocketMessageSubscription = websocketMessage.subscribe(message =>{
              if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
            });

            return () =>{
              websocketMessageSubscription.unsubscribe();
              _websocket.send(JSON.stringify({op: "TransactionExtendedUnsubscribe", transactionId:txid }));
            };
          }):
          BlockCount.pipe(switchMap(blockCount => from(sendRequest({
            op: "getTransactionExtended",
            transactionId: txid,
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );
      transactionObservables[txid] = transactionObservable;
    }

     return transactionObservable;
  }

  const addressUnspentObservables = {}
  const getAddressUnspent = (addressId) =>{ //TODO: This is a memory leak

    var addressUnspentObservable = addressUnspentObservables[addressId];

    if (addressUnspentObservable == null)
    {
      addressUnspentObservable = webSocket.pipe(
        switchMap(webSocket => webSocket ?
          Observable.create(function(observer) {

            var subscriptionId = getSubscriptionId();

            _websocket.send(JSON.stringify({op: "AddressUnspentSubscribe", subscriptionId: subscriptionId, address:addressId}));
            var websocketMessageSubscription = websocketMessage.subscribe(message =>{
              if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
            });

            return () =>{
              websocketMessageSubscription.unsubscribe();
              _websocket.send(JSON.stringify({op: "AddressUnspentUnsubscribe", address:addressId}));
            };
          }):
          getAddress(addressId).pipe(switchMap(blockCount => from(sendRequest({
            op: "getAddressUnspent",
            address: addressId
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      addressUnspentObservables[addressId] = addressUnspentObservable;
    }
      
     return addressUnspentObservable;
  }





  var addressObservables = {}
  var getAddress = (addressId) =>{ //TODO: This is a memory leak

    var addressObservable = addressObservables[addressId];

    if (addressObservable == null)
    {
      addressObservable = webSocket.pipe(
        switchMap(webSocket => webSocket ?
          Observable.create(function(observer) {

            var subscriptionId = getSubscriptionId();

            _websocket.send(JSON.stringify({op: "AddressSubscribe", subscriptionId: subscriptionId, address:addressId}));
            var websocketMessageSubscription = websocketMessage.subscribe(message =>{
              if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
            });

            return () =>{
              websocketMessageSubscription.unsubscribe();
              _websocket.send(JSON.stringify({op: "AddressUnsubscribe", address:addressId}));
            };
          }):
          BlockCount.pipe(switchMap(blockCount => from(sendRequest({
            op: "getAddress",
            address: addressId
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );

      addressObservables[addressId] = addressObservable;
    }
      
     return addressObservable;
  }

  var getAddressTxs = (address, pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getAddressTxs",
      address:address,
      pos:pos,
      pageSize: rowsPerPage,
      extended:true
    });
  }
  

  var masternodeCount = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "MasternodeCountSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "MasternodeCountUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getMasternodeCount",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  


  var masternodeList = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "MasternodeListSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "MasternodeListUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getMasternodeList",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );


  var masternodeObservables = {}
  var masternode = (output) =>{  //TODO: This is a memory leak

    var masternodeObservable = masternodeObservables[output]

    if (masternodeObservable == null)
    {
      masternodeObservable = webSocket.pipe(
        switchMap(webSocket => webSocket ?
          Observable.create(function(observer) {
    
            var subscriptionId = getSubscriptionId();
    
            _websocket.send(JSON.stringify({op: "MasternodeExtendedSubscribe", subscriptionId: subscriptionId, output:output}));
            var websocketMessageSubscription = websocketMessage.subscribe(message =>{
              if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
            });
    
            return () =>{
              websocketMessageSubscription.unsubscribe();
              _websocket.send(JSON.stringify({op: "MasternodeExtendedUnsubscribe", output:output}));
            };
          }):
          interval(30000).pipe(switchMap(blockCount => from(sendRequest({
            op: "getMasternodeList",
            output:output
          }))))
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );
    } 

    return masternodeObservable;
  }

  var getMasternodeEvents = (output, pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getMasternodeEvents",
      output: output,
      pos: pos,
      pageSize: rowsPerPage
    })
  }

  var getPayoutStats = (address, type, unit) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getPayoutStats",
      address: address,
      type: type,
      unit: unit
    })
  }
  
  var masternodeWinners = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "MasternodeWinnersSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "MasternodeWinnersUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getMasternodeWinners",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  

  var memPoolInfo = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "RawMemPoolSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "RawMemPoolUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getRawMemPool",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  


  var rawMemPool = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "RawMemPoolSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "RawMemPoolUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getRawMemPool",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  

  var peerInfo = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "PeerInfoSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "PeerInfoUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getPeerInfo",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );


  var richListCount = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "RichListCountSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "RichListCountUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getRichListCount",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  

  var getRichList = (pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getRichList",
      pos: pos,
      pageSize: rowsPerPage,
      extended: true
    });
  }


  var txOutSetInfo = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "TxOutSetInfoSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "TxOutSetInfoUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getTxOutSetInfo",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  


  var networkHashps = webSocket.pipe(
    switchMap(webSocket => webSocket ?
      Observable.create(function(observer) {

        var subscriptionId = getSubscriptionId();

        _websocket.send(JSON.stringify({op: "NetworkHashpsSubscribe", subscriptionId: subscriptionId}));
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.subscriptionId == subscriptionId && message.error == null) observer.next(message.data);
        });

        return () =>{
          websocketMessageSubscription.unsubscribe();
          _websocket.send(JSON.stringify({op: "NetworkHashpsUnsubscribe"}));
        };
      }):
      interval(30000).pipe(switchMap(blockCount => from(sendRequest({
        op: "getNetworkHashps",
      }))))
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  


  var validateAddress = (address) =>{
    return sendRequest({
      op: "validateAddress",
      address: address
    });
  };

  var sendRawTransaction = (hex, allowHighFees) =>{
    return sendRequest({
      op: "sendRawTransaction",
      hex: hex,
      allowHighFees: allowHighFees
    });
  };

  

  var Chaincoin = {
    messagePrefix: 'DarkCoin Signed Message:\n',
    bip32: {
      public: 0x02FE52F8,
      private: 0x02FE52CC
    },
    bech32: "chc",
    pubKeyHash: 0x1C,
    scriptHash: 0x04,
    wif: 0x9C
  };

  if (Environment.environment == "Test"){
    Chaincoin = {
      messagePrefix: 'DarkCoin Signed Message:\n',
      bip32: {
        public: 0x02FE52F8,
        private: 0x02FE52CC
      },
      bech32: "tchc",
      pubKeyHash: 0x50,
      scriptHash: 0x2c,
      wif: 0xd8
    };
  }

  export default {
    webSocket:webSocket,
    websocketMessage,
    blockCount: BlockCount,
    getBlock: getBlock,
    getBlocks,
    getTransaction:getTransaction,
    getAddress: getAddress,
    getAddressTxs,
    getAddressUnspent: getAddressUnspent,
    masternodeCount: masternodeCount,
    masternodeList: masternodeList,
    masternode: masternode,
    getMasternodeEvents,
    masternodeWinners,

    peerInfo,

    memPoolInfo,
    rawMemPool,

    richListCount,
    getRichList,

    txOutSetInfo,
    networkHashps,

    validateAddress,
    getPayoutStats,

    sendRawTransaction,

    Chaincoin
  }