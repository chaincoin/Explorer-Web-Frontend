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





  export default {
    BlockCount: BlockCount
  }