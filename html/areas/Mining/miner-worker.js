

self.importScripts('https://peterolson.github.io/BigInteger.js/BigInteger.min.js');

self.importScripts("scripts/helper.js?id=14");
self.importScripts("scripts/op.js?id=14");

self.importScripts("scripts/aes.js?id=14");
self.importScripts("scripts/blake.js?id=14");
self.importScripts("scripts/bmw.js?id=14");
self.importScripts("scripts/cubehash.js?id=14");
self.importScripts("scripts/echo.js?id=14");
self.importScripts("scripts/groestl.js?id=14");

self.importScripts("scripts/jh.js?id=14");
self.importScripts("scripts/keccak.js?id=14");
self.importScripts("scripts/luffa.js?id=14");

self.importScripts("scripts/shavite.js?id=14");
self.importScripts("scripts/simd.js?id=14");
self.importScripts("scripts/skein.js?id=14");

try{
    self.importScripts("c11.js?id=14");
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

    javaScriptMinerData = setupJavaScriptMinerData(javaScriptMinerData, miningHeader.blockHeaderHex, miningHeader.target);
    nonceRange = new bigInt(miningHeader.nonceRange, 16);

    if (miner != null) webAssemblyMinerData = setupWebAssemblyMinerData(webAssemblyMinerData, miningHeader.blockHeaderHex, miningHeader.target);

}

var mine = function () {

    var attempts = maxAttempts * (strength / 100);

    if (miningHeader != null) {
        if (miner != null && webAssemblyMinerData == null) {
            webAssemblyMinerData = setupWebAssemblyMinerData(webAssemblyMinerData, miningHeader.blockHeaderHex, miningHeader.target);
        }

        if (miner != null && webAssemblyMinerData != null) {
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
        else {
            if (JavaScriptMiner(javaScriptMinerData, attempts)) {

                var minedMessage = {
                    event: "MinedBlock",
                    jobId: miningHeader.jobId,
                    nonce: javaScriptMinerData.nonce,
                    extraNonce: miningHeader.extraNonce,
                    time: miningHeader.time
                };
                
                sendWebsocketRequest({
                    op: "submitBlock",
                    jobId: miningHeader.jobId,
                    nonce: javaScriptMinerData.nonce,
                    extraNonce: miningHeader.extraNonce,
                    time: miningHeader.time
                }).then(function(success){
                    self.postMessage(minedMessage);
                });

                miningHeader = null;
                sendWebsocketRequest({op:"getMiningHeader"});
            }
            if (nonceRange.lt(javaScriptMinerData.nonce)) {
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




function setupJavaScriptMinerData(data, blockHeaderHex, targetHex) {
    if (data == null) data = {
        blockHeaderBuffer: new Uint8Array(80),
        nonce: 0,
        targetBigInt: null,
        found: false
    };

    hex2bin(blockHeaderHex, data.blockHeaderBuffer);
    data.nonce = 0;
    data.targetBigInt = new bigInt(targetHex, 16);
    data.found = false;

    return data;
}


function JavaScriptMiner(data, attempts) {

    for (var i = 0; i < attempts; i++) {
        int32ToBinLe(data.nonce, data.blockHeaderBuffer, 76);
        var blockHeaderHashBuffer = ComputeC11Hash(data.blockHeaderBuffer);
        var blockHeaderHashBigInt = bigInt.fromArray(blockHeaderHashBuffer, 256);

        if (blockHeaderHashBigInt.lt(data.targetBigInt)) return true;
        else data.nonce = data.nonce + 1;
    }

    return false;
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

function bin2hex(bin) {
    var result = "";

    for (var i = 0; i < bin.length; i++) {

        var hex = bin[i].toString(16);
        if (hex.length < 2) hex = "0" + hex;

        result = result + hex;
    }

    return result;
}

function int32ToBinLe(value, buffer, offset) {
    if (buffer == null) {
        buffer = new Uint8Array(4);
        offset = 0;
    }

    buffer[offset + 0] = intGetbyte(value, 0);
    buffer[offset + 1] = intGetbyte(value, 1);
    buffer[offset + 2] = intGetbyte(value, 2);
    buffer[offset + 3] = intGetbyte(value, 3);
    return buffer;
}

function intGetbyte(value, pos) {
    return (value >> (8 * pos)) & 0xff;
}

function bitesToTarget(bits) {
    var bytes = parseInt(bits.substring(0, 2), 16);

    return bits.substring(2) + pad("", (bytes - 3) * 2, "0");

}


function ComputeC11Hash(input) {

    var output = null;

    var a = blake(input, 1, 1);
    a = bmw(a, 1, 1);
    a = groestl(a, 1, 1);
    a = jh(a, 1, 1);
    a = _keccak(a, 1, 1);
    a = skein(a, 1, 1);
    a = luffa(a, 1, 1);
    a = cubehash(a, 1, 1);
    a = shavite(a, 1, 1);
    a = simd(a, 1, 1);
    a = echo(a, 1, 1);
    output = a.slice(0, 32);
    return output.reverse();
}

var _keccak = function (str, format, output) {
    var msg = str;
    if (format === 2) {
        msg = h.int32Buffer2Bytes(str);
    }
    if (output === 1) {
        return keccak.keccak_512['array'](msg);
    } else if (output === 2) {
        return h.bytes2Int32Buffer(keccak.keccak_512['array'](msg));
    } else {
        return keccak.keccak_512['hex'](msg);
    }
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
        websocket.send('{"op":"newBlockSubscribe"}');
    };
        
    websocket.onmessage = function (evt) { 
        var message = JSON.parse(evt.data);
        
        if (message.op == "newBlock")
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






