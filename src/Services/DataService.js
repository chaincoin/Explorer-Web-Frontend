import { Observable, Subject} from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import axios from 'axios'
import Environment from './Environment';



var _websocket = null;
var websocketRequestId = 0;
var pendingWebsocketRequests = {};

var websocketSubscriptionId = 0;

var websocketMessage = new Subject();

function sendWebsocketRequest(request)
{
    request.id = websocketRequestId;
    websocketRequestId++;

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


      pendingWebsocketRequests["r" + request.id] = pendingWebsocketRequest;
    });
}


var newWebsocketSubscriptionId = () =>{
  websocketSubscriptionId++;
  return websocketSubscriptionId;
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

const subscription = (entity, parameters) =>{
    return Observable.create(function(observer) {


        var subscriptionId = newWebsocketSubscriptionId();
        var subscribeRequest = Object.assign({}, parameters, {op: entity + "Subscribe", subscriptionId: subscriptionId});
        var unsubscribeRequest = Object.assign({}, parameters, {op: entity + "Unsubscribe", subscriptionId: subscriptionId}); 

        sendWebsocketRequest(subscribeRequest).catch((err) => {
            observer.error(err);
        });

        var websocketMessageSubscription = websocketMessage.subscribe(message =>{
            if (message.subscriptionId == subscriptionId){
               if (message.error == null) observer.next(message.data);
               else observer.error(message.error);
            } 
        });

        return () =>{
            websocketMessageSubscription.unsubscribe();
            sendWebsocketRequest(unsubscribeRequest).catch((err) => {});
        }
    })
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
      pendingWebsocketRequests = {};

      websocketSubscriptionId = 0; //reset

      websocketRetryTimer = 500; //reset
      
      observer.next(true);
    });

    // Listen for messages
    tempWebsocket.addEventListener('message', function (event) { //TODO: how to handle subscriptions
      var message = JSON.parse(event.data);
            
      if (message.id != null)
      {
        var pendingWebsocketRequest = pendingWebsocketRequests["r" + message.id];
        if (pendingWebsocketRequest != null)
        {
            if (message.success)pendingWebsocketRequest.resolve(message);
            else pendingWebsocketRequest.reject(message);
            clearTimeout(pendingWebsocketRequest.timer);
            eval("delete pendingWebsocketRequests.r" + message.id);
        }
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



export default {
    webSocket,
    sendRequest,
    subscription
}