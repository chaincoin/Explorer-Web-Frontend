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

    var getBlockCountHttp = () =>{
      sendRequest({
        op: "getBlockCount"
      }).then(processBlockCount);
    };
    

    

    var webSocketSubscription = webSocket.subscribe(enabled =>{

      if (enabled == true)
      {
        if (intervalId != null) clearInterval(intervalId);
        intervalId = null;
        sendRequest({op: "getBlockCount"}).then(processBlockCount)
        _websocket.send(JSON.stringify({op: "newBlockSubscribe"}));//subscribe to event //TODO: should i really be using the web socket directly, if i use send request it throws an error as subcriptions are responded to
      }
      else
      {
        if (intervalId == null) {
          intervalId = setInterval(getBlockCountHttp, 30000);
          getBlockCountHttp();
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



  var getBlock = (blockId) =>{

    return Observable.create(function(observer) {

      var _block = null;

      var getBlockHttp = () =>{
        axios.get(Environment.blockchainApiUrl + "/getBlock?hash=" + blockId + "&extended=true")
        .then(res => res.data)
        .then((block) => {

          if (_block == null || _block.confirmations != block.confirmations)
          {
            _block = block;
            observer.next(block);
          }
          
        });
      };

      var blockCountSubscription = BlockCount.subscribe(blockCount => getBlockHttp());

      return () => {
        blockCountSubscription.unsubscribe();
      }
    });
  }

  var getBlocks = (blockPos, rowsPerPage) => {
    return axios.get(`${Environment.blockchainApiUrl}/getBlocks?blockId=${blockPos}&pageSize=${rowsPerPage}&extended=true`)
    .then(res => res.data);
  }


  var getTransaction = (txid) =>{

    return Observable.create(function(observer) {

      var _tranaction = null;

      var getTransactionHttp = () =>{
        axios.get(Environment.blockchainApiUrl + "/getTransaction?txid=" + txid + "&extended=true")
        .then(res => res.data)
        .then((tranaction) => {

          if (_tranaction == null || _tranaction.confirmations != tranaction.confirmations)
          {
            _tranaction = tranaction;
            observer.next(tranaction);
          }
          
        });
      };

      var blockCountSubscription = BlockCount.subscribe(blockCount => getTransactionHttp());

      return () => {
        blockCountSubscription.unsubscribe();
      }


    });
  }


  var getAddress = (addressId) =>{ //TODO: Cache the Observable so it can be shared

    return Observable.create(function(observer) {

      var _address = null;

      var getAddressHttp = () =>{
        axios.get(Environment.blockchainApiUrl + "/getAddress?address=" + addressId)
        .then(res => res.data)
        .then((address) => {

          if (_address == null || _address.balance != address.balance) //TODO: is this good enough
          {
            _address = address;
            observer.next(address);
          }
          
        });
      };

      var blockCountSubscription = BlockCount.subscribe(blockCount => getAddressHttp());

      return () => {
        blockCountSubscription.unsubscribe();
      }


    });
  }

  var getAddressTxs = (address, pos, rowsPerPage) => {
    return axios.get(`${Environment.blockchainApiUrl}/getAddressTxs?address=${address}&pos=${pos}&pageSize=${rowsPerPage}&extended=true`)
      .then(res => res.data);
  }

  var masternodeCount = Observable.create(function(observer) {

    var _masternodeCount = null;

    var getMasternodeCountHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getMasternodeCount")
      .then(res => res.data)
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
      axios.get(Environment.blockchainApiUrl + "/getMasternodeList")
      .then(res => res.data)
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


  var getMasternode = (output) =>{ //TODO: Cache the Observable so it can be shared
    return Observable.create(function(observer) {

      var _masternode = null;
  
      var getMasternodeHttp = () =>{
        axios.get(Environment.blockchainApiUrl + `/getMasternode?output=${output}&extended=true`)
        .then(res => res.data)
        .then((masternode) => {
          _masternode = masternode;
          observer.next(masternode);
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

  var getMasternodeEvents = (output, pos, rowsPerPage) => {
    return axios.get(`${Environment.blockchainApiUrl}/getMasternodeEvents?output=${output}&pos=${pos}&pageSize=${rowsPerPage}&extended=true`)
      .then(res => res.data);
  }
  
  var masternodeWinners = Observable.create(function(observer) {

    var getMasternodeWinnersHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getMasternodeWinners?")
      .then(res => res.data)
      .then((masternodeWinners) => {
        observer.next(masternodeWinners);
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getMasternodeWinnersHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  });

  var memPoolInfo = Observable.create(function(observer) { 

    var _memPoolInfo = null;

    var getMemPoolHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getMemPoolInfo")
      .then(res => res.data)
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
  });


  var rawMemPool = Observable.create(function(observer) { 

    var _rawMemPool = null;

    var getMemPoolHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getRawMemPool?extended=true")
      .then(res => res.data)
      .then((rawMemPool) => {

        _rawMemPool= rawMemPool;
        observer.next(rawMemPool);
        
      });
    };

    var memPoolInfoSubscription = memPoolInfo.subscribe(memPoolInfo => getMemPoolHttp());

    return () => {
      memPoolInfoSubscription.unsubscribe();
    }
  });


  var richListCount = Observable.create(function(observer) {

    var _richList = null;

    var getAddressHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getRichListCount")
      .then(res => res.data)
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
  });

  var getRichList = (pos, rowsPerPage) => {
    return axios.get(`${Environment.blockchainApiUrl}/getRichList?pos=${pos}&pageSize=${rowsPerPage}&extended=true`)
      .then(res => res.data);
  }


  var txOutSetInfo = Observable.create(function(observer) {
    var getTxOutSetInfoHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getTxOutSetInfo?")
      .then(res => res.data)
      .then((txOutSetInfo) => {
        observer.next(txOutSetInfo);
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getTxOutSetInfoHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  });


  var networkHashps = Observable.create(function(observer) {
    var getNetworkHashpsHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getNetworkHashps?")
      .then(res => res.data)
      .then((txOutSetInfo) => {
        observer.next(txOutSetInfo);
      });
    };

    var blockCountSubscription = BlockCount.subscribe(blockCount => getNetworkHashpsHttp());

    return () => {
      blockCountSubscription.unsubscribe();
    }
  });


  var validateAddress = (address) =>{
    return axios.get(Environment.blockchainApiUrl + "/validateAddress?address="+ address)
    .then(res => res.data);
  };


  export default {
    webSocket:webSocket,
    websocketMessage,
    blockCount: BlockCount,
    getBlock: getBlock,
    getBlocks,
    getTransaction:getTransaction,
    getAddress: getAddress,
    getAddressTxs,
    masternodeCount: masternodeCount,
    masternodeList: masternodeList,
    getMasternode: getMasternode,
    getMasternodeEvents,
    masternodeWinners,

    memPoolInfo,
  
    rawMemPool,

    richListCount,
    getRichList,

    txOutSetInfo,
    networkHashps,

    validateAddress
  }