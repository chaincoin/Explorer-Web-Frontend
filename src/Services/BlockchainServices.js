import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import axios from 'axios'
import Environment from './Environment';




const BlockCount = Observable.create(function(observer) {

    var _blockCount = 0;

    var getBlockCountHttp = () =>{
      axios.get(Environment.blockchainApiUrl + "/getBlockCount")
      .then(res => res.data)
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