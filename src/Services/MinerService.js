
import { BehaviorSubject  } from 'rxjs';
import BlockchainServices from './BlockchainServices'
import Environment from './Environment'

var _workers = [];
var _strength = 10;
var _threads = 1;
var _mining = false;
var _minedBlocks = [];

var _hashRateInterval = null;


const strength = new BehaviorSubject(_strength);
const threads = new BehaviorSubject(_threads);
const mining = new BehaviorSubject(_mining);
const hashRate = new BehaviorSubject(0);
const minedBlocks = new BehaviorSubject(_minedBlocks);




const setStrength = (__strength) => {

    _strength = __strength;
    for(var i = 0; i < _workers.length; i++)
    {
        var worker = _workers[i];
        worker.postMessage({
            cmd:"setStrength",
            strength: _strength
        });
    }

    strength.next(_strength);
}

const setThreads = (__threads) => {

    _threads = __threads;
    var makeWorker = () =>
    {
        var worker = new Worker('/miner-worker.js?id=14');
        worker.addEventListener('message', (e) => {
            //console.log(e.data);
            var request = e.data;

            if (request.event == "HashRate"){
                worker.hashRate = request.hashRate;
            }

            if (request.event == "MinedBlock"){


                
                var getBlockSubscription = BlockchainServices.getBlock(request.blockHash).subscribe((block) =>{
                  getBlockSubscription.unsubscribe();

                  _minedBlocks.push(block);
                  minedBlocks.next(_minedBlocks);
                });

            }

        }, false);

        worker.postMessage({
            cmd:"setWsUrl",
            wsUrl: Environment.webServicesApiUrl
        });

        worker.postMessage({
            cmd:"setStrength",
            strength:  _strength
        });

        if (mining) worker.postMessage({cmd:"start"});

        _workers.push(worker);
    };


    while(_workers.length < _threads)
    {
        makeWorker();
    }

    while(_workers.length > _threads)
    {
        var work = _workers.pop();
        work.postMessage({
            cmd:"close"
        });
    }

    threads.next(_threads);

}


const start = () =>{
    setThreads(_threads);

    for(var i = 0; i < _workers.length; i++)
    {
        var worker = _workers[i];
        worker.postMessage({cmd:"start"});
    }

    _hashRateInterval = setInterval(() =>{
      var _hashRate = 0; 
      for(var i = 0; i < _workers.length; i++)
      {
          if (_workers[i].hashRate != null) _hashRate = _hashRate + _workers[i].hashRate;
      }

      hashRate.next(_hashRate);
    },1000);

    _mining = true;
    mining.next(_mining);
}

const stop = () =>{
    for(var i = 0; i < _workers.length; i++)
    {
        var worker = _workers[i];
        worker.postMessage({cmd:"stop"});
    }
    clearInterval(_hashRateInterval);

    _mining = false;
    mining.next(_mining);
    hashRate.next(0);
}





export default {
    strength,
    threads,
    mining,
    hashRate,
    minedBlocks,

    setStrength,
    setThreads,
    start,
    stop,
}