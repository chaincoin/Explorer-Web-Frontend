importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');


// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '316900835772'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.

const messaging = firebase.messaging();




messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    badge:"/images/icons/favicon-192x192-Live.png",
    icon:"/images/icons/favicon-192x192-Live.png",
    body: "Background Message body.",
    actions:[]
  };


  if (payload.data.eventType == "newBlock")
  {
    notificationTitle = "New Block";
    notificationOptions.body = "A new block has been mined";

    notificationOptions.actions.push({
      title: "View",
      action:"OpenUrl-" + "#Explorer/Block/" + payload.data.blockHash
    });

      
  }
  else if (payload.data.eventType == "newAddressTransaction")
  {

      notificationTitle = "New Address Transaction";
      notificationOptions.body = "A new transaction for address " + payload.data.address;

      notificationOptions.actions.push({
        title: "View",
        action:"OpenUrl-" + "#Explorer/Address/" + payload.data.address
      });


  }
  else if (payload.data.eventType === 'newMasternode')
  {

    notificationTitle = "New Masternode";
    notificationOptions.body = "A new Masternode ";

    notificationOptions.actions.push({
      title: "View",
      action:"OpenUrl-" + "#Explorer/MasternodeList/" + payload.data.masternodeOutPoint
    });

  }
  else if (payload.data.eventType === 'changedMasternode' )
  {

    var masternode = JSON.parse(payload.data.masternode);
    
    notificationTitle = "Masternode Status";
    notificationOptions.body = "Masternode status change from " + masternode.previousStatus + " to " + masternode.status;

    notificationOptions.actions.push({
      title: "View",
      action:"OpenUrl-" + "#Explorer/MasternodeList/" + payload.data.masternodeOutPoint
    });

  }
  else if ( payload.data.eventType === 'removedMasternode' )
  {
    notificationTitle = "Removed Masternode";
    notificationOptions.body = "A removed Masternode ";

    notificationOptions.actions.push({
      title: "View",
      action:"OpenUrl-" + "#Explorer/MasternodeList/" + payload.data.masternodeOutPoint
    });
  }
  else if (payload.data.eventType === 'expiringMasternode')
  {
    notificationTitle = "Expiring Masternode";
    notificationOptions.body = "A expiring Masternode";

    notificationOptions.actions.push({
      title: "View",
      action:"OpenUrl-" + "#Explorer/MasternodeList/" + payload.data.masternodeOutPoint
    });
  }

  return self.registration.showNotification(notificationTitle,notificationOptions);
});


self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  clients.openWindow("/"+event.action.substring(8));
}, false);