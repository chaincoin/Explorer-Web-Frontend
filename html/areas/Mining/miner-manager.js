

self.importScripts('https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.min.js');
self.importScripts('https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js');

var wsUrl = null;
var threads = 1;
var supportMiner = null;
var miners = [];
var ports = [this]

var hashRateReportingIntervalId = null;



var processMinerMessage = function(miner, e){

    var request = e.data;

    if (request.event == "newHeaderRequired")
    {
        sendWebsocketRequest({op:"getMiningHeader"}).then(function(response){
            miner.postMessage({
                cmd:"setMiningHeader",
                miningHeader: response.data
            });
        });
    }
    else if (request.event == "mined")
    {
        sendWebsocketRequest({
            op: "submitBlock",
            jobId: request.jobId,
            nonce: request.nonce,
            extraNonce: request.extraNonce,
            time: request.time
        }).then(function(response){
            debugger;
            if (response.success == true)
            {
                for(var i = 0; i < ports.length; i++)
                {
                    ports[i].postMessage({
                        event:"MinedBlock"
                    });
                }
            }
        });
    }
    else if (request.event == "HashRate")
    {
        if (miner.hashRate != request.hashRate){
            miner.hashRate = request.hashRate;
        }
    }
    
}

var processMessage = function(port, e) {

    var request = e.data;

    var response = {
        cmd: request.cmd,
        success: false,
    };

    if (request.id != null) response.id = request.id;

     
    if (request.cmd == "start")
    {
        start();
        response.success = true;
    }
    else if (request.cmd == "stop")
    {
        stop();
        response.success = true;
    }
    else if (request.cmd == "unload")
    {
        unload();
        response.success = true;
    }
    else if (request.cmd == "setThreads")
    {
        setThreads(request.threads);
        response.success = true;
    }
    else if (request.cmd == "setStrength")
    {
        setStrength(request.strength);
        response.success = true;
    }
    else if (request.cmd == "setWsUrl")
    {
        wsUrl = request.wsUrl;
        startWebsocket();
        response.success = true;
    }

    port.postMessage(response);
}


var start = function(){
    for(var i = 0; i < miners.length; i++)
    {
        let miner = miners[i];
        miner.postMessage({cmd:"start"});

        sendWebsocketRequest({op:"getMiningHeader"}).then(function(response){
            miner.postMessage({
                cmd:"setMiningHeader",
                miningHeader: response.data
            });
        });
    }

    hashRateReportingIntervalId = setInterval(reportHashRate, 1000);
}

var stop = function(){
    for(var i = 0; i < miners.length; i++)
    {
        miners[i].postMessage({cmd:"stop"});
    }

    clearInterval(hashRateReportingIntervalId);
    
}

var unload = function(){
    stop();

    for(var i = 0; i < miners.length; i++)
    {
        miners[i].terminate();
    }

    while(miners.length > 0) miners.pop();

    if (supportMiner != null) supportMiner.terminate();
}



var setStrength = function(strength){
    for(var i = 0; i < miners.length; i++)
    {
        miners[i].postMessage({cmd:"setStrength", strength: strength});
    }
}

var setThreads = function(_threads)
{
    if (self.Worker == null)
    {
        setTimeout(function(){
            setThreads(_threads,200);
        });
        return;
    }

    threads = _threads;
    if (miners.length < threads)
    {
        while(miners.length < threads)
        {
            let miner = new Worker('miner-worker.js?id=14');
            miner.hashRate = 0;

            miner.addEventListener('message', function(e) {
                processMinerMessage(miner, e);
            }, false);

            miners.push(miner);
        }
    }
    else if (miners.length > threads)
    {
        while(miners.length > threads)
        {
            var mine = miners.pop();

            mine.postMessage({cmd:"stop"});
            mine.postMessage({cmd:"close"});

            setTimeout(function(){
                mine.terminate()
            }, 1000);
        }
    }
}

var newBlock = function(){

    supportMiner.postMessage({cmd:"setMiningHeader"});
    sendWebsocketRequest({op:"getMiningHeader"}).then(function(response){
        supportMiner.postMessage({
            cmd:"setMiningHeader",
            miningHeader: response.data
        });
    });

    for(var i = 0; i < miners.length; i++)
    {
        let miner = miners[i];
        miner.postMessage({cmd:"setMiningHeader"});
        sendWebsocketRequest({op:"getMiningHeader"}).then(function(response){
            miner.postMessage({
                cmd:"setMiningHeader",
                miningHeader: response.data
            });
        });
    }
}

var reportHashRate = function(){
    var totalHashRate = 0;
    for(var i = 0; i < miners.length; i++)
    {
        totalHashRate = totalHashRate + miners[i].hashRate;
    }

    for(var i = 0; i < ports.length; i++)
    {
        ports[i].postMessage({
            event:"HashRate",
            hashRate: totalHashRate
        });
    }
}

/*

onconnect = function(e) {
    var port = e.ports[0];
  
    port.addEventListener('message', processMessage);
  
    port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
}

*/

self.addEventListener('message', function(e)
{
    processMessage(self, e);
});


var websocket = null;
var websocketRequestId = 0;
var pendingWebsocketRequests = {};
var websocketRetryTimer = 500;
            
var startWebsocket = function(){
    //websocket = new WebSocket(wsUrl);
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = function() {
        websocketRetryTimer = 500;
        websocket.send('{"op":"newBlockSubscribe"}');
    };
        
    websocket.onmessage = function (evt) { 
        var message = JSON.parse(evt.data);
        
        if (message.op == "newBlock")
        {
            newBlock();
        }
        
        var pendingWebsocketRequest = pendingWebsocketRequests["r" + message.id];
        if (pendingWebsocketRequest != null)
        {
            if (message.success)pendingWebsocketRequest.promise.resolve(message);
            else pendingWebsocketRequest.promise.reject(message);
            clearTimeout(pendingWebsocketRequest.timer);
            eval("delete pendingWebsocketRequests.r" + message.id);
        }
    };
        
    websocket.onclose = function() { 
        websocket = null;
        for (var key in pendingWebsocketRequests) {
            // skip loop if the property is from prototype
            if (!pendingWebsocketRequests.hasOwnProperty(key)) continue;
            clearTimeout(pendingWebsocketRequests[key].timer);
            pendingWebsocketRequests[key].promise.reject();
        }

        pendingWebsocketRequests = {};

        setTimeout(startWebsocket,websocketRetryTimer);

        websocketRetryTimer = websocketRetryTimer * 2;
    };
}


function sendWebsocketRequest(request)
{

    
    request.id = websocketRequestId;

    var resolve = null;
    var reject = null;
    var promise = new Promise(function(_resolve, _reject){
        resolve = _resolve;
        reject = _reject;
    }); 

    promise.resolve = resolve;
    promise.reject = reject;

    var pendingWebsocketRequest = {
        request: request,
        promise:promise,
        timer: setTimeout(function(){
            promise.reject();
        },30000)
    };
    


    let send = function(){
        if (websocket != null && websocket.readyState == 1)
        {
            websocket.send(JSON.stringify(request)); 
        }
        else
        {
            setTimeout(send, 200);
        }
    }
    send();

    

    pendingWebsocketRequests["r" + websocketRequestId] = pendingWebsocketRequest;
    websocketRequestId++;
    return promise;
}



var setupSupportMiner = function(){

    if (self.Worker == null)
    {
        setTimeout(setupSupportMiner,200);
        return;
    }
    supportMiner = new Worker('miner-worker.js?id=14');
    supportMiner.hashRate = 0;

    supportMiner.addEventListener('message', function(e) {
        processMinerMessage(supportMiner, e);
    }, false);

    supportMiner.postMessage({cmd:"setStrength", strength: 5});
    supportMiner.postMessage({cmd:"start"});

    sendWebsocketRequest({op:"getMiningHeader"}).then(function(response){
        supportMiner.postMessage({
            cmd:"setMiningHeader",
            miningHeader: response.data
        });
    });
}


setThreads(1);
setupSupportMiner();