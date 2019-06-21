import { Observable, Subject  } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import axios from 'axios'
import Environment from './Environment';



var _websocket = null;
var websocketRequestId = 0;
var pendingWebsocketRequests = {};

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



const BlockCount = Observable.create(function(observer) {

    var _blockCount = 0;
    var intervalId = null;


    var processBlockCount = (blockCount) => {
      if (_blockCount != blockCount) {
        _blockCount = blockCount;
        observer.next(blockCount);
      }
    };

    var getBlockCount = () =>{
      sendRequest({
        op: "getBlockCount"
      }).then(processBlockCount);
    };
    

    

    var webSocketSubscription = webSocket.subscribe(enabled =>{

      if (enabled == true)
      {
        if (intervalId != null) clearInterval(intervalId);
        intervalId = null;
        _websocket.send(JSON.stringify({op: "newBlockSubscribe"}));//subscribe to event //TODO: should i really be using the web socket directly, if i use send request it throws an error as subcriptions are responded to
        getBlockCount();
      }
      else
      {
        if (intervalId == null) {
          intervalId = setInterval(getBlockCount, 30000);
          getBlockCount();
        }
      }

    });

    
    var websocketMessageSubscription = websocketMessage.subscribe(message =>{
      if (message.op == "newBlock") processBlockCount(message.data.height);
    });
     
    

    return () => {
        clearInterval(intervalId);
        webSocketSubscription.unsubscribe();
        websocketMessageSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var blockObservables = {}

  var getBlock = (blockId) =>{ //TODO: This is a memory leak

    var blockObservable = blockObservables[blockId];
    

    if (blockObservable == null){

      var _block = null;
      var _blockCount = null;
      blockObservable = Observable.create(function(observer) {

        var getBlockHttp = () =>{
          sendRequest({
            op: "getBlock",
            hash: blockId,
            extended:true
          })
          .then((block) => {
            if (_block == null || _block.confirmations != block.confirmations)
            {
              _block = block;
              observer.next(block);
            }
          }).catch((err) =>{
            observer.error(new Error(err));
          });
        };
  
        var blockCountSubscription = BlockCount.subscribe(blockCount => {
          if (_blockCount == null || _block == null || _blockCount != blockCount) {
            getBlockHttp();
            _blockCount = blockCount;
          }else{
            observer.next(_block);
          }
        });
  
        return () => {
          blockCountSubscription.unsubscribe();
        }
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }));

      blockObservables[blockId] = blockObservable;
    } 

    return blockObservable;
  }

  var getBlocks = (blockPos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getBlocks",
      blockId: blockPos,
      pageSize: rowsPerPage,
      extended:true
    })
  }

  var transactionObservables = {}

  var getTransaction = (txid) =>{ //TODO: This is a memory leak

    var transactionObservable = transactionObservables[txid];

    if (transactionObservable == null)
    {
      var _tranaction = null;
      var _blockCount = null;

      transactionObservable = Observable.create(function(observer) {
  
        var getTransactionHttp = () =>{
          sendRequest({
            op: "getTransaction",
            txid: txid,
            extended:true
          })
          .then((tranaction) => {
            if (_tranaction == null || _tranaction.confirmations != tranaction.confirmations)
            {
              _tranaction = tranaction;
              observer.next(tranaction);
            }
          }).catch((err) =>{
            observer.error(new Error(err));
          });
        };
        
        var blockCountSubscription = BlockCount.subscribe(blockCount =>{
          if (_blockCount == null || _tranaction == null || _blockCount != blockCount) {
            getTransactionHttp();
            _blockCount = blockCount;
          }else{
            observer.next(_tranaction);
          }
        });
  
        return () => {
          blockCountSubscription.unsubscribe();
        }
      });
      transactionObservables[txid] = transactionObservable;
    }

     return transactionObservable;
  }

  const addressUnspentObservables = {}
  const getAddressUnspent = (addressId) =>{ //TODO: This is a memory leak

    var addressUnspentObservable = addressUnspentObservables[addressId];

    if (addressUnspentObservable == null)
    {
      addressUnspentObservable = Observable.create(function(observer) {

        var _unspent = null;

        var _getAddressUnspent = () =>{
          sendRequest({
            op: "getAddressUnspent",
            address:addressId
          }).then((unspent) => {
            if (_unspent == null || _unspent.length != unspent.length) //TODO: is this good enough
            {
              _unspent = unspent;
              observer.next(unspent);
            }
          }).catch((err) =>{
            observer.error(new Error(err));
          });
        };
        

        var addressSubscription = getAddress(addressId).subscribe(_getAddressUnspent); 
        
  
        return () => {
            addressSubscription.unsubscribe();
        }
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }));

      addressUnspentObservables[addressId] = addressUnspentObservable;
    }
      
     return addressUnspentObservable;
  }





  var addressObservables = {}
  var getAddress = (addressId) =>{ //TODO: This is a memory leak

    var addressObservable = addressObservables[addressId];

    if (addressObservable == null)
    {
      addressObservable = Observable.create(function(observer) {

  
        var _address = null;
        var blockCountSubscription = null;
  
        var processAddress = (address) => {
          if (_address == null || _address.balance != address.balance) //TODO: is this good enough
          {
            _address = address;
            observer.next(address);
          }
        };
  
        var _getAddress = () =>{
          sendRequest({
            op: "getAddress",
            address:addressId
          }).then(processAddress).catch((err) =>{
            observer.error(new Error(err));
          });
        };
        
  
        
  
        var webSocketSubscription = webSocket.subscribe(enabled =>{
  
          if (enabled == true)
          {
            if (blockCountSubscription != null) blockCountSubscription.unsubscribe();
            blockCountSubscription = null;
            _getAddress();
            _websocket.send(JSON.stringify({op: "newAddressTransactionSubscribe", address:addressId}));//subscribe to event //TODO: should i really be using the web socket directly, if i use send request it throws an error as subcriptions are responded to
          }
          else
          {
            blockCountSubscription = BlockCount.subscribe(blockCount => _getAddress()); //TODO: this will trigger a getAddress straight away, even if block count hasnt changed
          }
  
        });
  
        
        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
          if (message.op == "newAddressTransaction" && message.data.address==addressId) processAddress(message.data);
        });
        
        
  
        return () => {
            if (_websocket != null)_websocket.send(JSON.stringify({op: "newAddressTransactionUnsubscribe", address:addressId})); //TODO: this feels wrong
            if(blockCountSubscription != null) blockCountSubscription.unsubscribe();
            webSocketSubscription.unsubscribe();
            websocketMessageSubscription.unsubscribe();
        }
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }));

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
  

  var masternodeCount = Observable.create(function(observer) {

    var _masternodeCount = null;

    var getMasternodeCountHttp = () =>{

      sendRequest({
        op: "getMasternodeCount",
      })
      .then((masternodeCount) => {
        _masternodeCount = masternodeCount;
        observer.next(masternodeCount);
      });
    };

    var intervalId = setInterval(getMasternodeCountHttp, 30000);
    getMasternodeCountHttp();

    return () => {
        clearInterval(intervalId);
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));

  


  var masternodeList = Observable.create(function(observer) {

    var _masternodeList = null;

    var getMasternodeListHttp = () =>{
      sendRequest({
        op: "getMasternodeList",
      })
      .then((masternodeList) => {
        _masternodeList = masternodeList;
        observer.next(masternodeList);
      });
    };

    var intervalId = setInterval(getMasternodeListHttp, 30000);
    getMasternodeListHttp();

    return () => {
        clearInterval(intervalId);
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var masternodeObservables = {}
  var getMasternode = (output) =>{  //TODO: This is a memory leak

    var masternodeObservable = masternodeObservables[output]

    if (masternodeObservable == null)
    {
      masternodeObservable = Observable.create(function(observer) {

        var _masternode = null;
    
        var getMasternodeHttp = () =>{
          sendRequest({
            op: "getMasternode",
            output: output,
            extended: true
          })
          .then((masternode) => {
            _masternode = masternode;
            observer.next(masternode);
          }).catch((err) =>{
            observer.error(new Error(err));
          });
        };
    
        var intervalId = setInterval(getMasternodeHttp, 30000);
        getMasternodeHttp();
    
        return () => {
            clearInterval(intervalId);
        }
      
      }).pipe(shareReplay({
        bufferSize: 1,
        refCount: true
      }));
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
  
  var masternodeWinners = Observable.create(function(observer) {

    var getMasternodeWinnersHttp = () =>{
      sendRequest({
        op: "getMasternodeWinners"
      })
      .then((masternodeWinners) => {
        observer.next(masternodeWinners);
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getMasternodeWinnersHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  

  var memPoolInfo = Observable.create(function(observer) { 

    var _memPoolInfo = null;

    var getMemPoolHttp = () =>{
      sendRequest({
        op: "getMemPoolInfo"
      })
      .then((memPoolInfo) => {

        if (_memPoolInfo == null || _memPoolInfo.size != memPoolInfo.size || _memPoolInfo.bytes != memPoolInfo.bytes)
        {
          _memPoolInfo= memPoolInfo;
          observer.next(memPoolInfo);
        }
       
        
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getMemPoolHttp());

    var intervalId = setInterval(getMemPoolHttp, 30000);
    getMemPoolHttp();

    return () => {
      blockCountSubscription.unsubscribe();
      clearInterval(intervalId);
    }
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  


  var rawMemPool = Observable.create(function(observer) { 

    var _rawMemPool = null;

    var getMemPoolHttp = () =>{
      sendRequest({
        op: "getRawMemPool",
        extended: true
      })
      .then((rawMemPool) => {
        //TODO: maybe check that the rawMemPool has changed before calling next
        _rawMemPool= rawMemPool;
        observer.next(rawMemPool);
        
      });
    };

    var memPoolInfoSubscription = null;

    var webSocketSubscription = webSocket.subscribe(enabled =>{
  
      if (enabled == true)
      {
        if (memPoolInfoSubscription != null) memPoolInfoSubscription.unsubscribe();
        memPoolInfoSubscription = null;
        getMemPoolHttp();
        _websocket.send(JSON.stringify({op: "memPoolChangeSubscribe"}));//subscribe to event //TODO: should i really be using the web socket directly, if i use send request it throws an error as subcriptions are responded to
      }
      else
      {
        memPoolInfoSubscription = memPoolInfo.subscribe(memPoolInfo => getMemPoolHttp()); //TODO: this will trigger a getMemPoolHttp straight away, even if memPoolInfo hasnt changed
      }

    });

    
    var websocketMessageSubscription = websocketMessage.subscribe(message =>{
      if (message.op == "memPoolChanged") getMemPoolHttp();
    });
    
    

    return () => {
        if (_websocket != null)_websocket.send(JSON.stringify({op: "memPoolChangeUnsubscribe"})); //TODO: this feels wrong
        if(memPoolInfoSubscription != null) memPoolInfoSubscription.unsubscribe();
        webSocketSubscription.unsubscribe();
        websocketMessageSubscription.unsubscribe();
    }

  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  

  var peerInfo = Observable.create(function(observer) {

    var _peerInfo = null;

    var getPeerInfoHttp = () =>{
      sendRequest({
        op: "getPeerInfo",
      })
      .then((peerInfo) => {
        _peerInfo = peerInfo;
        observer.next(peerInfo);
      });
    };

    var intervalId = setInterval(getPeerInfoHttp, 30000);
    getPeerInfoHttp();

    return () => {
        clearInterval(intervalId);
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var richListCount = Observable.create(function(observer) {

    var _richList = null;

    var getAddressHttp = () =>{
      sendRequest({
        op: "getRichListCount",
        extended: true
      })
      .then((richList) => {

        if (_richList == null || _richList != richList) 
        {
          _richList= richList;
          observer.next(richList);
        }
        
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getAddressHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  

  var getRichList = (pos, rowsPerPage) => { //TODO: should this be an Observable, can the data change over time?
    return sendRequest({
      op: "getRichList",
      pos: pos,
      pageSize: rowsPerPage,
      extended: true
    });
  }


  var txOutSetInfo = Observable.create(function(observer) {
    var getTxOutSetInfoHttp = () =>{
      sendRequest({
        op: "getTxOutSetInfo",
      })
      .then((txOutSetInfo) => {
        observer.next(txOutSetInfo);
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getTxOutSetInfoHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  


  var networkHashps = Observable.create(function(observer) {
    var getNetworkHashpsHttp = () =>{
      sendRequest({
        op: "getNetworkHashps",
      })
      .then((txOutSetInfo) => {
        observer.next(txOutSetInfo);
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getNetworkHashpsHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  


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
    getMasternode: getMasternode,
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