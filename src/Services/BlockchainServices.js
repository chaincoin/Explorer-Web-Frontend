import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';




var apiUrl = "https://api.chaincoinexplorer.co.uk";


const BlockCount = Observable.create(function(observer) {

    var _blockCount = 0;

    var getBlockCountHttp = () =>{
      fetch(apiUrl + "/getBlockCount")
      .then(res => res.json())
      .then((blockCount) => {
        if (_blockCount != blockCount) {
          _blockCount = blockCount;
          observer.next(blockCount);
        }
      });
    };

    var intervalId = setInterval(getBlockCountHttp, 30000);
    getBlockCountHttp();

    return () => {
        clearInterval(intervalId);
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));



  var getBlock = (blockId) =>{

    return Observable.create(function(observer) {

      var _block = null;

      var getBlockHttp = () =>{
        fetch(apiUrl + "/getBlock?hash=" + blockId + "&extended=true")
        .then(res => res.json())
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


  var getTransaction = (txid) =>{

    return Observable.create(function(observer) {

      var _tranaction = null;

      var getTransactionHttp = () =>{
        fetch(apiUrl + "/getTransaction?txid=" + txid + "&extended=true")
        .then(res => res.json())
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
        fetch(apiUrl + "/getAddress?address=" + addressId)
        .then(res => res.json())
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

  var masternodeCount = Observable.create(function(observer) {

    var _masternodeCount = null;

    var getMasternodeCountHttp = () =>{
      fetch(apiUrl + "/getMasternodeCount")
      .then(res => res.json())
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
      fetch(apiUrl + "/getMasternodeList")
      .then(res => res.json())
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
        fetch(apiUrl + `/getMasternode?output=${output}&extended=true`)
        .then(res => res.json())
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

  
  var masternodeWinners = Observable.create(function(observer) {

    var getMasternodeWinnersHttp = () =>{
      fetch(apiUrl + "/getMasternodeWinners?")
      .then(res => res.json())
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
      fetch(apiUrl + "/getMemPoolInfo")
      .then(res => res.json())
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
      fetch(apiUrl + "/getRawMemPool?extended=true")
      .then(res => res.json())
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
      fetch(apiUrl + "/getRichListCount")
      .then(res => res.json())
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




  var txOutSetInfo = Observable.create(function(observer) {
    var getTxOutSetInfoHttp = () =>{
      fetch(apiUrl + "/getTxOutSetInfo?")
      .then(res => res.json())
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
      fetch(apiUrl + "/getNetworkHashps?")
      .then(res => res.json())
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
    return fetch(apiUrl + "/validateAddress?address="+ address)
    .then(res => res.json());
  };


  export default {
    blockCount: BlockCount,
    getBlock: getBlock,
    getTransaction:getTransaction,
    getAddress: getAddress,
    masternodeCount: masternodeCount,
    masternodeList: masternodeList,
    getMasternode: getMasternode,
    masternodeWinners,

    memPoolInfo,
  
    rawMemPool,

    richListCount,

    txOutSetInfo,
    networkHashps,

    validateAddress
  }