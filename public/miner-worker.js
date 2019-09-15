

self.importScripts('https://peterolson.github.io/BigInteger.js/BigInteger.min.js');


try{
    self.importScripts("/c11.js?id=14");
}
catch(ex){}


var mining = false;
var minerTimerId = null;
var hashRateReportIntervalId = null;

var hashRate = 0;
var strength = 5;

var maxRestTime = 200;
var maxAttempts = 400;

var miningHeader = null;
var miningStartTime = null;
var nonceRange = null;
var javaScriptMinerData = null;
var webAssemblyMinerData = null;

var setupMiner = function (_miningHeader) {
    miningHeader = _miningHeader;
    if (miningHeader == null) return;

    miningStartTime = new Date().getTime();

    nonceRange = new bigInt(miningHeader.nonceRange, 16);
    if (miner == null) return;
    webAssemblyMinerData = setupWebAssemblyMinerData(webAssemblyMinerData, miningHeader.blockHeaderHex, miningHeader.target);

}

var mine = function () {

    var attempts = maxAttempts * (strength / 100);

    if (miner != null && miningHeader != null) {
        if (webAssemblyMinerData == null) {
            webAssemblyMinerData = setupWebAssemblyMinerData(webAssemblyMinerData, miningHeader.blockHeaderHex, miningHeader.target);
        }

        if (webAssemblyMinerData != null) {
            attempts = attempts * 4;
            if (WebAssemblyMiner(webAssemblyMinerData, attempts)) {

                var minedMessage = {
                    event: "MinedBlock",
                    jobId: miningHeader.jobId,
                    nonce: webAssemblyMinerData.nonce,
                    extraNonce: miningHeader.extraNonce,
                    time: miningHeader.time
                };

                sendWebsocketRequest({
                    op: "submitBlock",
                    jobId: miningHeader.jobId,
                    nonce: webAssemblyMinerData.nonce,
                    extraNonce: miningHeader.extraNonce,
                    time: miningHeader.time
                }).then(function(result){
                    minedMessage.blockHash = result.data.blockHash;
                    self.postMessage(minedMessage);
                });

                

                miningHeader = null;
                sendWebsocketRequest({op:"getMiningHeader"});
            }
            if (nonceRange.lt(webAssemblyMinerData.nonce) ||  miningStartTime + 90000 < new Date().getTime()) {
                miningHeader = null;
                sendWebsocketRequest({op:"getMiningHeader"});
            }
        }

        var duration = new Date().getTime() - miningStartTime;

        if (miner != null && webAssemblyMinerData != null) hashRate = (webAssemblyMinerData.nonce / duration) * 1000;
        else hashRate = (javaScriptMinerData.nonce / duration) * 1000;

        

        var restTime = maxRestTime * (1 - (strength / 100));
        minerTimerId = setTimeout(mine, restTime);
    }
    else {
        if (hashRate != 0) {
            hashRate = 0;
        }
        minerTimerId = setTimeout(mine, 100);
    }




}




function setupWebAssemblyMinerData(data, blockHeaderHex, targetHex) {
    if (data == null) data = {
        minerInputPtr: Module._malloc(80),
        minerTargetPtr: Module._malloc(32),
        minerOutputPtr: Module._malloc(4),
        nonce: 0
    };

    var minerInputBuffer = new Uint8Array(Module.HEAPU8.buffer, data.minerInputPtr, 80);
    hex2bin(blockHeaderHex, minerInputBuffer);

    let minerTargetBuffer = new Uint8Array(Module.HEAPU8.buffer, data.minerTargetPtr, 32);
    hex2bin(pad(targetHex, 64, "0"), minerTargetBuffer);

    data.nonce = 0;
    return data;
}


function WebAssemblyMiner(data, mineAttempts) {
    /*
            var data = {
                minerInputPtr: null,
                minerTargetPtr: null,
                minerOutputPtr: null,
                mineAttempts: null,
                nonce: null
            }
    */
    var result = miner(data.minerInputPtr, data.nonce, data.minerTargetPtr, data.minerOutputPtr, mineAttempts, 80);
    if (result == 1) {
        let minerOutpuBuffer = new Uint32Array(Module.HEAPU8.buffer, data.minerOutputPtr, 1);
        data.nonce = minerOutpuBuffer[0];
        return true;
    }
    else {
        data.nonce = data.nonce + mineAttempts;
        return false
    }
}


function pad(data, length, padding) {
    while (data.length < length) data = padding + data;
    return data;
}


function hex2bin(hex, buffer) {
    if (buffer == null) buffer = new Uint8Array(hex.length / 2);

    for (var i = 0; i < hex.length - 1; i += 2) {
        buffer[i / 2] = parseInt(hex.substr(i, 2), 16)
    }

    return buffer;
}







var start = function () {
    if (mining == true) return false;

    minerTimerId = setTimeout(mine, 0);
    mining = true;

    miningHeader = null;
    sendWebsocketRequest({op:"getMiningHeader"});

    self.postMessage({
        event: "Start"
    });

    hashRateReportIntervalId = setInterval(function(){
        self.postMessage({
            event: "HashRate",
            hashRate: hashRate
        });
    },2000);
}


var stop = function () {
    if (mining == false) return false;
    miningHeader = null;
    mining = false;
    clearTimeout(minerTimerId);
    clearInterval(hashRateReportIntervalId)

    self.postMessage({
        event: "Stop"
    });

    return true;
}

var close = function () {
    if (mining == true) stop();


    self.postMessage({
        event: "Close"
    });

    setTimeout(self.close);
    return true;
}

self.addEventListener('message', function (e) {

    var request = e.data;

    var response = {
        cmd: request.cmd,
        success: false,
    };

    if (request.id != null) response.id = request.id;

    try {
        switch (request.cmd) {
            case 'start':
                response.success = start();
                break;
            case 'stop':
                response.success = stop();
                break;
            case 'close':
                response.success = close();
                break;
            case 'setMiningHeader':
                setupMiner(request.miningHeader);
                response.success = true;
                break;
            case 'setStrength':
                strength = request.strength;
                response.success = true;
                break;
            case "setWsUrl":
                wsUrl = request.wsUrl;
                startWebsocket();
                response.success = true;
                break;
            default:
        };
    }
    catch (ex) {
        console.log(ex);
    }

    self.postMessage(response);

}, false);


var newBlock = function(){

    miningHeader = null;
    sendWebsocketRequest({op:"getMiningHeader"});
}




var websocket = null;
var websocketRequestId = 0;
var pendingWebsocketRequests = {};
var websocketRetryTimer = 500;
            
var startWebsocket = function(){
    //websocket = new WebSocket(wsUrl);
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = function() {
        websocketRetryTimer = 500;
        websocket.send('{"op":"BestBlockHashSubscribe"}');
    };
        
    websocket.onmessage = function (evt) { 
        var message = JSON.parse(evt.data);
        
        if (message.op == "BestBlockHash")
        {
            newBlock();
        }
        else if (message.op == "getMiningHeaderResponse")
        {
            setupMiner(message.data);
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
            try{ pendingWebsocketRequests[key].promise.reject(); }
            catch(ex){}
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


var hasher = null;
var miner = null;


try {

    Module.onRuntimeInitialized = function () {

        hasher = Module.cwrap('c11_hash', 'number', ['number', 'number', 'number']);
        miner = Module.cwrap('mine', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

    };
}
catch (ex) { }






