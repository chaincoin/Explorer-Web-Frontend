import { Observable, BehaviorSubject  } from 'rxjs';
import { shareReplay, first } from 'rxjs/operators';

import axios from 'axios'
import Environment from './Environment';


const firebaseId = new BehaviorSubject();



function sendHttpRequest(request)
{
  var queryParms = "?_=" + new Date().getTime();
  for (var key in request) {
      if (!request.hasOwnProperty(key) || key == 'op') continue;
      queryParms = queryParms + "&" + key + "=" + request[key];
  }

  return axios.get(Environment.notificationsApiUrl + "/" + request.op + queryParms)
  .then(res => res.data);
}


var firebaseConfig = {
    apiKey: "AIzaSyD0P5F8zfmS1fuIDtK_HAOa-AeKTZw91MY",
    authDomain: "chaincoinexplorer.firebaseapp.com",
    databaseURL: "https://chaincoinexplorer.firebaseio.com",
    projectId: "chaincoinexplorer",
    storageBucket: "chaincoinexplorer.appspot.com",
    messagingSenderId: "316900835772",
    appId: "1:316900835772:web:91c5ce11ca192dc0"
};

// Initialize Firebase
window.firebase.initializeApp(firebaseConfig); 

const messaging = window.firebase.messaging(); 
messaging.usePublicVapidKey("BPIxwVCl8BcMHksgYoO5lBim_hxbE48snFExKNLB56VZ5Cg1VMnwRk1quiKgvOg7YFFIFwo3qAbnSVhYZGeqcME");

messaging.onMessage(function(payload) {
    console.log('Message received. ', payload);
    debugger;
    if (payload.data.eventType == "newBlock")
    {
        
    }
    else if (payload.data.eventType == "newAddressTransaction")
    {
        
    }
    else if (payload.data.eventType === 'newMasternode')
    {
        
    }
    else if (payload.data.eventType === 'changedMasternode' )
    {
        
    }
    else if ( payload.data.eventType === 'removedMasternode' )
    {
        
    }
    else if (payload.data.eventType === 'expiringMasternode')
    {
        
    }
});


if (Notification.permission == 'granted'){
    messaging.getToken().then(function(_firebaseId) {
        if (_firebaseId) firebaseId.next(_firebaseId); //TODO: need to check if firebase id has changed and update server
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
    });
}


const getFirebaseId = () =>{

    return new Promise((resolve, reject) => {
        firebaseId.pipe(first()).subscribe((_firebaseId) =>{

            if (_firebaseId != null) {
                resolve(_firebaseId);
            }
            else
            {
                messaging.requestPermission()
                .then(() => messaging.getToken())
                .then((_firebaseId) => {
                    firebaseId.next(_firebaseId);
                    resolve(_firebaseId);
                })
                .catch(reject);
            }
            
        });
    });
}

const deleteSubscriptions = () => {
    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"deleteSubscriptions",
            firebaseId: firebaseId
        });
    });
}


const saveBlockSubscription = () => {
    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"saveBlockSubscription",
            firebaseId: firebaseId
        });
    });
}


const deleteBlockSubscription = () => {
    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"deleteBlockSubscription",
            firebaseId: firebaseId
        });
    });
}



const blockSubscription = Observable.create(function(observer) {
    var _blockSubscription = null;
    var _firebaseId = null;

    var getBlockSubscription = () =>{
        sendHttpRequest({
            op:"isBlockSubscription",
            firebaseId: _firebaseId
        })
        .then((blockSubscription) => {

            if (_blockSubscription == null || _blockSubscription != blockSubscription)
            {
                _blockSubscription = blockSubscription;
                observer.next(blockSubscription);
            }
        
        });
    };

    var intervalId = null;
    var firebaseIdSubscription = firebaseId.subscribe((firebaseId) =>{
        _firebaseId = firebaseId;

        if (firebaseId != null)
        {
            intervalId = setInterval(getBlockSubscription, 30000);
            getBlockSubscription();
        }
        else
        {
            clearInterval(intervalId);
            observer.next(false);
        }

    });

    return () => {
        firebaseIdSubscription.unsubscribe();
        clearInterval(intervalId);
    }

}).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
}));



const saveMasternodeSubscription = (masternodeOutpoint) => {
    var a = masternodeSubscriptionObservables.length; 
    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"saveMasternodeSubscription",
            firebaseId: firebaseId,
            masternodeOutpoint: masternodeOutpoint
        });
    });
}


const deleteMasternodeSubscription = (masternodeOutpoint) => {

    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"deleteMasternodeSubscription",
            firebaseId: firebaseId,
            masternodeOutpoint: masternodeOutpoint
        });
    });
    
}

var masternodeSubscriptionObservables = {}

const masternodeSubscription = (masternodeOutpoint) =>{

    var masternodeSubscriptionObservable = masternodeSubscriptionObservables[masternodeOutpoint];

    if (masternodeSubscriptionObservable == null)
    {
        
        masternodeSubscriptionObservable = Observable.create(function(observer) {
            var _masternodeSubscription = null;
            var _firebaseId = null;
        
            var getMasternodeSubscription = () =>{
                sendHttpRequest({
                    op:"isMasternodeSubscription",
                    firebaseId: _firebaseId,
                    masternodeOutpoint:masternodeOutpoint
                })
                .then((masternodeSubscription) => {
        
                    if (_masternodeSubscription == null || _masternodeSubscription != masternodeSubscription)
                    {
                        _masternodeSubscription = masternodeSubscription;
                        observer.next(masternodeSubscription);
                    }
                
                });
            };

            var intervalId = null;
            var firebaseIdSubscription = firebaseId.subscribe((firebaseId) =>{
                _firebaseId = firebaseId;

                if (firebaseId != null)
                {
                    intervalId = setInterval(getMasternodeSubscription, 30000);
                    getMasternodeSubscription();
                }
                else
                {
                    clearInterval(intervalId);
                    observer.next(false);
                }

            });
        
            return () => {
                firebaseIdSubscription.unsubscribe();
                clearInterval(intervalId);
            }
        }).pipe(shareReplay({
            bufferSize: 1,
            refCount: true
        }));

        masternodeSubscriptionObservables[masternodeOutpoint] = masternodeSubscriptionObservable;
    }   

    return masternodeSubscriptionObservable;
}



const saveAddressSubscription = (address) => {

    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"saveAddressSubscription",
            firebaseId: firebaseId,
            address: address
        });
    });
    
}


const deleteAddressSubscription = (address) => {
    return getFirebaseId()
    .then((firebaseId) =>{
        return sendHttpRequest({
            op:"deleteAddressSubscription",
            firebaseId: firebaseId,
            address: address
        });
    });
}

var addressSubscriptionObservables = {}

const addressSubscription = (address) =>{

    var addressSubscriptionObservable = addressSubscriptionObservables[address];

    if (addressSubscriptionObservable == null)
    {
        addressSubscriptionObservable = Observable.create(function(observer) {
            var _addressSubscription = null;
            var _firebaseId = null;

            var getAddressSubscription = () =>{
                sendHttpRequest({
                    op:"isAddressSubscription",
                    firebaseId: _firebaseId,
                    address:address
                })
                .then((addressSubscription) => {
        
                    if (_addressSubscription == null || _addressSubscription != addressSubscription)
                    {
                        _addressSubscription = addressSubscription;
                        observer.next(addressSubscription);
                    }
                
                });
            };
        
            var intervalId = null;
            var firebaseIdSubscription = firebaseId.subscribe((firebaseId) =>{
                _firebaseId = firebaseId;

                if (firebaseId != null)
                {
                    intervalId = setInterval(getAddressSubscription, 30000);
                    getAddressSubscription();
                }
                else
                {
                    clearInterval(intervalId);
                    observer.next(false);
                }

            });
        
            return () => {
                firebaseIdSubscription.unsubscribe();
                clearInterval(intervalId);
            }
        }).pipe(shareReplay({
            bufferSize: 1,
            refCount: true
        }));

        addressSubscriptionObservables[address] = addressSubscriptionObservable;
    }   

    return addressSubscriptionObservable;
}




export default {
    deleteSubscriptions,

    saveBlockSubscription,
    deleteBlockSubscription,
    
    saveMasternodeSubscription,
    deleteMasternodeSubscription,

    saveAddressSubscription,
    deleteAddressSubscription,

    blockSubscription,
    masternodeSubscription,
    addressSubscription
};