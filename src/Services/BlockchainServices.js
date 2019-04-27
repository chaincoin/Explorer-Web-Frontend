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


  var getAddress = (addressId) =>{

    return Observable.create(function(observer) {

      var _address = null;

      var getAddressHttp = () =>{
        fetch(apiUrl + "/getAddress?address=" + addressId)
        .then(res => res.json())
        .then((address) => {

          if (_address == null || _address.confirmations != address.confirmations)
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


  export default {
    blockCount: BlockCount,
    getBlock: getBlock,
    getTransaction:getTransaction,
    getAddress: getAddress,
    masternodeCount: masternodeCount,
    masternodeList: masternodeList
  }