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

      var getBlockHttp = () =>{
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

      var blockCountSubscription = BlockCount.subscribe(blockCount => getBlockHttp());

      return () => {
        blockCountSubscription.unsubscribe();
      }


    });
  }


  export default {
    blockCount: BlockCount,
    getBlock: getBlock,
    getTransaction:getTransaction
  }